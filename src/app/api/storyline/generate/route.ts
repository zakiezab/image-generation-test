import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";
import type { StorylineScene } from "@/lib/storyline-types";
import { createSceneFromPayload } from "@/lib/storyline-types";
import { v4 as uuidv4 } from "uuid";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

const MAX_VIDEO_MB = 50;

/**
 * Generate scene-by-scene storyline (WHY → HOW → WHAT).
 * Supports: voiceover/scratch (JSON body), recording (multipart with video file).
 * Video requires GOOGLE_AI_API_KEY (Gemini). Text: Claude → Gemini → OpenAI.
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let inputType: string;
    let voiceoverScript = "";
    let scratchInput: { why?: string; how?: string; what?: string } = {};
    let recordingFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      inputType = (formData.get("inputType") as string) ?? "";
      recordingFile = formData.get("recording") as File | null;
      if (inputType !== "recording" || !recordingFile || recordingFile.size === 0) {
        return NextResponse.json(
          { error: "For recording, upload a video file (multipart field 'recording')." },
          { status: 400 }
        );
      }
      if (recordingFile.size > MAX_VIDEO_MB * 1024 * 1024) {
        return NextResponse.json(
          { error: `Video must be under ${MAX_VIDEO_MB}MB.` },
          { status: 400 }
        );
      }
    } else {
      const body = await request.json();
      inputType = body.inputType;
      voiceoverScript = body.voiceoverScript ?? "";
      scratchInput = body.scratchInput ?? {};
    }

    let prompt = "";
    if (inputType === "voiceover") {
      prompt = `Create a product demo motion graphic storyline from this voiceover script. Structure it scene by scene following WHY (problem/purpose) → HOW (solution/process) → WHAT (result).\n\nVOICEOVER SCRIPT:\n${voiceoverScript || ""}`;
    } else if (inputType === "scratch") {
      prompt = `Create a product demo motion graphic storyline from these building blocks. Structure it scene by scene following WHY → HOW → WHAT.\n\nWHY (Pain point / problem / purpose):\n${scratchInput?.why || ""}\n\nHOW (Solution / process):\n${scratchInput?.how || ""}\n\nWHAT (The result):\n${scratchInput?.what || ""}`;
    } else if (inputType === "recording" && recordingFile) {
      prompt = "Watch this product demo / screen recording video. Create a scene-by-scene storyline that captures what happens and what is said. Structure it following WHY (problem/purpose) → HOW (solution/process) → WHAT (result). Output only the JSON array of scenes, no other text.";
    } else {
      return NextResponse.json({ error: "Invalid inputType or missing input" }, { status: 400 });
    }

    const systemPrompt = `You are an expert scriptwriter for product demo motion graphics. Output a JSON array of scenes only. No other text, no markdown code blocks, no explanation. Each scene must have exactly these string fields: title, description (1-2 short sentences), voiceoverScript, suggestedVisuals (concise animation/visual suggestions), summary (1 sentence). Follow WHY → HOW → WHAT flow. Example: [{"title":"...","description":"...","voiceoverScript":"...","suggestedVisuals":"...","summary":"..."}]`;

    let text = "";

    // Recording: only Gemini can process video
    if (inputType === "recording" && recordingFile && process.env.GOOGLE_AI_API_KEY) {
      try {
        text = await generateFromVideo(recordingFile, systemPrompt, prompt, process.env.GOOGLE_AI_API_KEY);
      } catch (e) {
        console.error("Gemini video storyline error:", e);
        return NextResponse.json(
          { error: e instanceof Error ? e.message : "Failed to analyze video. Try a shorter or smaller video." },
          { status: 500 }
        );
      }
    }

    // Text-based: Claude → Gemini → OpenAI
    if (!text) {
      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      if (anthropicKey) {
        try {
          text = await generateWithClaude(systemPrompt, prompt, anthropicKey);
        } catch (e) {
          console.error("Claude storyline error:", e);
        }
      }
      if (!text && process.env.GOOGLE_AI_API_KEY) {
        try {
          text = await generateWithGemini(systemPrompt, prompt, process.env.GOOGLE_AI_API_KEY);
        } catch (e) {
          console.error("Gemini storyline error:", e);
        }
      }
      if (!text && process.env.OPENAI_API_KEY) {
        try {
          text = await generateWithOpenAI(systemPrompt, prompt, process.env.OPENAI_API_KEY);
        } catch (e) {
          console.error("OpenAI storyline error:", e);
        }
      }
    }

    if (!text) {
      return NextResponse.json(
        {
          error: inputType === "recording"
            ? "Video analysis requires GOOGLE_AI_API_KEY (Gemini)."
            : "No AI provider configured. Add ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY, or OPENAI_API_KEY.",
        },
        { status: 503 }
      );
    }

    const parsed = parseScenesJson(text);
    const scenes: StorylineScene[] = parsed.map((s, i) =>
      createSceneFromPayload(i + 1, {
        id: uuidv4(),
        title: s.title || `Scene ${i + 1}`,
        description: s.description || "",
        voiceoverScript: s.voiceoverScript || "",
        suggestedVisuals: s.suggestedVisuals || "",
        summary: s.summary || "",
      })
    );

    return NextResponse.json({ scenes });
  } catch (error) {
    console.error("Storyline generate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate storyline" },
      { status: 500 }
    );
  }
}

const FILE_ACTIVE_POLL_MS = 2000;
const FILE_ACTIVE_TIMEOUT_MS = 120000;

async function waitForFileActive(
  ai: InstanceType<typeof GoogleGenAI>,
  fileName: string
): Promise<void> {
  const deadline = Date.now() + FILE_ACTIVE_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const file = await ai.files.get({ name: fileName });
    const state = (file as { state?: string }).state;
    if (state === "ACTIVE") return;
    if (state === "FAILED")
      throw new Error("Video processing failed. Try a shorter or smaller video.");
    await new Promise((r) => setTimeout(r, FILE_ACTIVE_POLL_MS));
  }
  throw new Error("Video processing timed out. Try a shorter video.");
}

async function generateFromVideo(
  file: File,
  systemPrompt: string,
  userPrompt: string,
  apiKey: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "video/mp4";
  const tmpPath = join(tmpdir(), `storyline-video-${Date.now()}-${file.name || "video.mp4"}`);
  await writeFile(tmpPath, buffer);
  try {
    const uploaded = await ai.files.upload({
      file: tmpPath,
      config: { mimeType },
    });
    const uploadedFile = uploaded as { uri?: string; name?: string; mimeType?: string };
    const name = uploadedFile.name;
    const uri = uploadedFile.uri ?? name;
    const uploadedMime = uploadedFile.mimeType ?? mimeType;
    if (!name) throw new Error("File upload did not return a name");
    await waitForFileActive(ai, name);
    if (!uri) throw new Error("File upload did not return a URI");
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: createUserContent([
        createPartFromUri(uri, uploadedMime),
        `${systemPrompt}\n\n${userPrompt}`,
      ]),
      config: { maxOutputTokens: 8192, responseMimeType: "application/json" },
    });
    const text = (res as { text?: string }).text?.trim();
    return text ?? "";
  } finally {
    await unlink(tmpPath).catch(() => {});
  }
}

function parseScenesJson(raw: string): Array<Record<string, string>> {
  // Strip markdown code blocks (```json ... ``` or ``` ... ```)
  let cleaned = raw
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
  // If the model wrapped the array in a code block with newlines, strip any remaining backticks
  cleaned = cleaned.replace(/^`+/, "").replace(/`+$/, "").trim();

  const tryParse = (str: string): Array<Record<string, string>> | null => {
    try {
      const parsed = JSON.parse(str);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      return arr.every((s) => s && typeof s === "object") ? arr : null;
    } catch {
      return null;
    }
  };

  let result = tryParse(cleaned);
  if (result) return result;

  // Maybe only the final ] was truncated
  result = tryParse(cleaned + "]");
  if (result) return result;

  // Extract the first complete JSON array by bracket matching
  const startIdx = cleaned.indexOf("[");
  if (startIdx !== -1) {
    let depth = 0;
    let endIdx = -1;
    for (let i = startIdx; i < cleaned.length; i++) {
      if (cleaned[i] === "[") depth++;
      else if (cleaned[i] === "]") {
        depth--;
        if (depth === 0) {
          endIdx = i;
          break;
        }
      }
    }
    if (endIdx !== -1) {
      result = tryParse(cleaned.slice(startIdx, endIdx + 1));
      if (result) return result;
    }

    // Salvage truncated response: find last complete object and close the array
    let arrayDepth = 0;
    let objectDepth = 0;
    let lastCompleteEnd = -1;
    for (let i = startIdx; i < cleaned.length; i++) {
      const c = cleaned[i];
      if (c === "[") arrayDepth++;
      else if (c === "]") arrayDepth--;
      else if (c === "{") objectDepth++;
      else if (c === "}") {
        objectDepth--;
        if (arrayDepth === 1 && objectDepth === 0) lastCompleteEnd = i;
      }
    }
    if (lastCompleteEnd !== -1) {
      const salvaged = cleaned.slice(startIdx, lastCompleteEnd + 1) + "]";
      result = tryParse(salvaged);
      if (result) return result;
    }
  }

  console.error("Storyline AI response (parse failed):", raw.slice(0, 800));
  throw new Error("AI did not return valid scene JSON. Try again or use a shorter input.");
}

async function generateWithClaude(
  system: string,
  userPrompt: string,
  apiKey: string
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { content: { text: string }[] };
  return data.content?.[0]?.text ?? "";
}

async function generateWithGemini(
  system: string,
  userPrompt: string,
  apiKey: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${system}\n\n${userPrompt}`,
    config: { maxOutputTokens: 8192, responseMimeType: "application/json" },
  });
  const text = (res as { text?: string }).text?.trim();
  return text ?? "";
}

async function generateWithOpenAI(
  system: string,
  userPrompt: string,
  apiKey: string
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 4096,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}
