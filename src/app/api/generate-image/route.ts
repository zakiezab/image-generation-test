import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { AI_BACKGROUND_SYSTEM_PROMPT } from "@/lib/ai-background-prompt";
import { SCENE_IMAGE_SYSTEM_PROMPT } from "@/lib/scene-image-prompt";

/**
 * AI Image Generation API
 * Uses Google AI (Imagen) when GOOGLE_AI_API_KEY is set.
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

    const googleKey = process.env.GOOGLE_AI_API_KEY?.trim();
    if (!googleKey) {
      console.info("[generate-image] No GOOGLE_AI_API_KEY set.");
      return NextResponse.json({
        error: "Add GOOGLE_AI_API_KEY to .env.local and restart the dev server.",
      });
    }

    try {
      const imageUrl = await generateWithGoogleAI(fullPrompt, googleKey, ratio);
      return NextResponse.json({ url: imageUrl, engine: "google" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[generate-image] Google AI failed:", msg);
      if (msg.includes("billed users") || msg.includes("billing") || msg.includes("only accessible to billed")) {
        return NextResponse.json({
          error: "Imagen is only available to billed Google Cloud accounts. Enable billing in Google AI Studio (aistudio.google.com).",
        });
      }
      throw err;
    }
  } catch (error) {
    console.error("Image generation error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate image";
    const hint = !process.env.GOOGLE_AI_API_KEY?.trim()
      ? " Add GOOGLE_AI_API_KEY to .env.local for AI images."
      : "";
    return NextResponse.json(
      { error: message + hint },
      { status: 500 }
    );
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

async function getPlaceholderImage(
  prompt: string,
  aspectRatio: string = "1:1"
): Promise<string> {
  const seed = Buffer.from(prompt).toString("base64").slice(0, 20);
  const [w, h] = aspectRatio === "16:9" ? [1024, 576] : [1024, 1024];
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}
