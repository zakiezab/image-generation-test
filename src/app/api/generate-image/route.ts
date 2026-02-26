import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { AI_BACKGROUND_SYSTEM_PROMPT } from "@/lib/ai-background-prompt";
import { SCENE_IMAGE_SYSTEM_PROMPT } from "@/lib/scene-image-prompt";

/**
 * AI Image Generation API
 * Supports: Google AI (Imagen), OpenAI DALL-E, or placeholder
 * Optional: aspectRatio ("1:1" | "16:9"), context ("hero" | "storyline") for scene visuals.
 */
export async function POST(request: NextRequest) {
  try {
    const { prompt, aspectRatio = "1:1", context = "hero" } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const isStoryline = context === "storyline";
    const systemPrompt = isStoryline ? SCENE_IMAGE_SYSTEM_PROMPT : AI_BACKGROUND_SYSTEM_PROMPT;
    const fullPrompt = systemPrompt + prompt.trim();
    const ratio = isStoryline ? "16:9" : (aspectRatio === "16:9" ? "16:9" : "1:1");

    // Prefer Google AI (Imagen) when GOOGLE_AI_API_KEY is set
    const googleKey = process.env.GOOGLE_AI_API_KEY;
    if (googleKey) {
      try {
        const imageUrl = await generateWithGoogleAI(fullPrompt, googleKey, ratio);
        return NextResponse.json({ url: imageUrl, engine: "google" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("billed users") || msg.includes("billing")) {
          const placeholderUrl = await getPlaceholderImage(fullPrompt, ratio);
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
      const imageUrl = await generateWithOpenAI(fullPrompt, openaiKey, ratio);
      return NextResponse.json({ url: imageUrl, engine: "openai" });
    }

    // No API key: placeholder for demo
    const placeholderUrl = await getPlaceholderImage(fullPrompt, ratio);
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
  apiKey: string,
  aspectRatio: string = "1:1"
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  let response;
  try {
    response = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: fullPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio === "16:9" ? "16:9" : "1:1",
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
  apiKey: string,
  aspectRatio: string = "1:1"
): Promise<string> {
  const size = aspectRatio === "16:9" ? "1792x1024" : "1024x1024";
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
      size,
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

async function getPlaceholderImage(
  prompt: string,
  aspectRatio: string = "1:1"
): Promise<string> {
  const seed = Buffer.from(prompt).toString("base64").slice(0, 20);
  const [w, h] = aspectRatio === "16:9" ? [1024, 576] : [1024, 1024];
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}
