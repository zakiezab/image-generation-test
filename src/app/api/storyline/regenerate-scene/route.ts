import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import type { StorylineScene } from "@/lib/storyline-types";
import { createSceneFromPayload } from "@/lib/storyline-types";

/**
 * Regenerate a single scene with optional user comments.
 */
export async function POST(request: NextRequest) {
  try {
    const { sceneId, comments, scene, allScenesContext } = (await request.json()) as {
      sceneId: string;
      comments: string;
      scene: StorylineScene;
      allScenesContext?: string;
    };

    if (!scene) {
      return NextResponse.json({ error: "Scene is required" }, { status: 400 });
    }

    const userPrompt = comments
      ? `Regenerate this scene with the following feedback. Keep the same structure (title, description, voiceoverScript, suggestedVisuals, summary). Return only valid JSON for this single scene object, no array, no markdown.\n\nCurrent scene: ${JSON.stringify({ title: scene.title, description: scene.description, voiceoverScript: scene.voiceoverScript, suggestedVisuals: scene.suggestedVisuals, summary: scene.summary })}\n\nUser feedback: ${comments}`
      : `Improve this scene (same structure). Return only valid JSON for this single scene object: title, description, voiceoverScript, suggestedVisuals, summary. No array, no markdown.\n\n${JSON.stringify({ title: scene.title, description: scene.description, voiceoverScript: scene.voiceoverScript, suggestedVisuals: scene.suggestedVisuals, summary: scene.summary })}`;

    const systemPrompt = `You are an expert scriptwriter for product demo motion graphics. Output a single JSON object with keys: title, description (short), voiceoverScript, suggestedVisuals, summary. No other text.`;

    let text = "";
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        text = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{ role: "user", content: userPrompt }],
          }),
        }).then(async (r) => {
          if (!r.ok) throw new Error(await r.text());
          const d = (await r.json()) as { content: { text: string }[] };
          return d.content?.[0]?.text ?? "";
        });
      } catch (e) {
        console.error(e);
      }
    }
    if (!text && process.env.GOOGLE_AI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });
        const res = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `${systemPrompt}\n\n${userPrompt}`,
          config: { maxOutputTokens: 1024, responseMimeType: "application/json" },
        });
        text = (res as { text?: string }).text?.trim() ?? "";
      } catch (e) {
        console.error(e);
      }
    }
    if (!text && process.env.OPENAI_API_KEY) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 1024,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });
      if (res.ok) {
        const d = (await res.json()) as { choices: { message: { content: string } }[] };
        text = d.choices?.[0]?.message?.content?.trim() ?? "";
      }
    }

    if (!text) {
      return NextResponse.json(
        { error: "No AI provider configured for regeneration." },
        { status: 503 }
      );
    }

    const parsed = parseSingleSceneJson(text);
    const updated = createSceneFromPayload(scene.index, {
      ...scene,
      id: sceneId,
      title: parsed.title ?? scene.title,
      description: parsed.description ?? scene.description,
      voiceoverScript: parsed.voiceoverScript ?? scene.voiceoverScript,
      suggestedVisuals: parsed.suggestedVisuals ?? scene.suggestedVisuals,
      summary: parsed.summary ?? scene.summary,
      imageUrl: scene.imageUrl,
    });

    return NextResponse.json({ scene: updated });
  } catch (error) {
    console.error("Regenerate scene error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to regenerate scene" },
      { status: 500 }
    );
  }
}

function parseSingleSceneJson(raw: string): Record<string, string> {
  const cleaned = raw.replace(/```json?\s*/gi, "").replace(/```\s*$/gi, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : {};
  }
}
