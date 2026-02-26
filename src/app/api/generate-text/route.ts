import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

/**
 * AI Text Generation API for title and description
 * Uses Google AI (Gemini) or OpenAI when API key is configured
 */
export async function POST(request: NextRequest) {
  try {
    const { context, type } = await request.json();

    const contextStr = typeof context === "string" ? context.trim() : "";
    const effectiveContext = contextStr || "hero visual for a tech or product brand";

    const googleKey = process.env.GOOGLE_AI_API_KEY;
    if (googleKey) {
      try {
        const result = await generateWithGoogleAI(effectiveContext, type, googleKey);
        return NextResponse.json(result);
      } catch (err) {
        console.error("Google AI text error:", err);
      }
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      try {
        const result = await generateWithOpenAI(effectiveContext, type, openaiKey);
        return NextResponse.json(result);
      } catch (err) {
        console.error("OpenAI text error:", err);
      }
    }

    // Fallback when no API key: return both title and description for type "both"
    const fallbackTitle = "Your Brand Story";
    const fallbackDesc = "Discover how we help businesses grow with innovative solutions.";
    if (type === "both") {
      return NextResponse.json({ title: fallbackTitle, description: fallbackDesc });
    }
    if (type === "title") {
      return NextResponse.json({ title: fallbackTitle });
    }
    return NextResponse.json({ description: fallbackDesc });
  } catch (error) {
    console.error("Text generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate text" },
      { status: 500 }
    );
  }
}

async function generateWithGoogleAI(
  context: string,
  type: "title" | "description" | "both",
  apiKey: string
): Promise<{ title?: string; description?: string }> {
  const ai = new GoogleGenAI({ apiKey });
  const systemPrompt = `You are a brand copywriter. Generate concise, professional marketing copy.
For titles: 3-6 words, punchy, memorable.
For descriptions: 1-2 sentences, compelling, under 100 characters.
When asked for both, reply with exactly two lines: first line "Title: <title>", second line "Description: <description>".`;

  const userPrompt =
    type === "both"
      ? `Based on this context, generate a title and description:\n\n${context}`
      : type === "title"
        ? `Generate a short title (3-6 words) for:\n\n${context}`
        : `Generate a short description (1-2 sentences) for:\n\n${context}`;

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${systemPrompt}\n\n${userPrompt}`,
    config: { maxOutputTokens: 150 },
  });

  const text = (res as { text?: string }).text?.trim();
  if (!text) throw new Error("No text in response");

  return parseGeneratedContent(text, type);
}

async function generateWithOpenAI(
  context: string,
  type: "title" | "description" | "both",
  apiKey: string
): Promise<{ title?: string; description?: string }> {
  const systemPrompt = `You are a brand copywriter. Generate concise, professional marketing copy.
For titles: 3-6 words, punchy, memorable.
For descriptions: 1-2 sentences, compelling, under 100 characters.`;

  const userPrompt =
    type === "both"
      ? `Based on this context, generate a title and description:\n\n${context}`
      : type === "title"
        ? `Generate a short title (3-6 words) for:\n\n${context}`
        : `Generate a short description (1-2 sentences) for:\n\n${context}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 150,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${err}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };
  const content = data.choices[0].message.content.trim();
  return parseGeneratedContent(content, type);
}

function parseGeneratedContent(
  content: string,
  type: "title" | "description" | "both"
): { title?: string; description?: string } {
  if (type === "both") {
    const lines = content.split("\n").map((s) => s.trim()).filter(Boolean);
    let title = "";
    let description = "";
    for (const line of lines) {
      if (/^title:\s*/i.test(line)) {
        title = line.replace(/^title:\s*/i, "").trim();
      } else if (/^description:\s*/i.test(line)) {
        description = line.replace(/^description:\s*/i, "").trim();
      } else if (!title) {
        title = line;
      } else if (!description) {
        description = line;
      }
    }
    if (!description && lines.length >= 2) {
      title = lines[0];
      description = lines.slice(1).join(" ");
    }
    return { title: title || undefined, description: description || undefined };
  }
  return type === "title" ? { title: content } : { description: content };
}
