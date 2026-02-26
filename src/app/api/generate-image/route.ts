import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { AI_BACKGROUND_SYSTEM_PROMPT } from "@/lib/ai-background-prompt";

/**
 * AI Image Generation API
 * Supports: Google AI (Imagen), OpenAI DALL-E, or placeholder
 * User prompt is always prefilled with the brand style prompt (hidden from UI).
 */
export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const fullPrompt = AI_BACKGROUND_SYSTEM_PROMPT + prompt.trim();

    // Prefer Google AI (Imagen) when GOOGLE_AI_API_KEY is set
    const googleKey = process.env.GOOGLE_AI_API_KEY;
    if (googleKey) {
      try {
        const imageUrl = await generateWithGoogleAI(fullPrompt, googleKey);
        return NextResponse.json({ url: imageUrl, engine: "google" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("billed users") || msg.includes("billing")) {
          const placeholderUrl = await getPlaceholderImage(fullPrompt);
          return NextResponse.json({
            url: placeholderUrl,
            engine: "placeholder",
            fallback: "Google Imagen requires billing. Using placeholder.",
          });
        }
        throw err;
      }
    }

    // Fallback: OpenAI
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      const imageUrl = await generateWithOpenAI(fullPrompt, openaiKey);
      return NextResponse.json({ url: imageUrl, engine: "openai" });
    }

    // No API key: placeholder for demo
    const placeholderUrl = await getPlaceholderImage(fullPrompt);
    return NextResponse.json({ url: placeholderUrl, engine: "placeholder" });
  } catch (error) {
    console.error("Image generation error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function generateWithGoogleAI(
  fullPrompt: string,
  apiKey: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  let response;
  try {
    response = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: fullPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: "1:1",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Google AI: ${msg}`);
  }

  const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
  if (!imageBytes) {
    throw new Error(
      "Google AI did not return an image. The model may require billing or a different region."
    );
  }

  return `data:image/png;base64,${imageBytes}`;
}

async function generateWithOpenAI(
  fullPrompt: string,
  apiKey: string
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: fullPrompt,
      n: 1,
      size: "1024x1024",
      response_format: "url",
      quality: "hd",
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${err}`);
  }

  const data = (await response.json()) as { data: { url: string }[] };
  return data.data[0].url;
}

async function getPlaceholderImage(prompt: string): Promise<string> {
  // Use picsum.photos as placeholder when no API key is configured
  const seed = Buffer.from(prompt).toString("base64").slice(0, 20);
  return `https://picsum.photos/seed/${seed}/1024/1024`;
}
