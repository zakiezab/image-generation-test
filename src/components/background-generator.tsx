"use client";

import { useHeroStore } from "@/store/hero-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PROMPT_GUIDELINES } from "@/lib/prompt-guidelines";
import { v4 as uuidv4 } from "uuid";

export function BackgroundGenerator() {
  const {
    prompt,
    setPrompt,
    generatedImages,
    setGeneratedImages,
    setSelectedBackgroundUrl,
    selectedBackgroundUrl,
    isGenerating,
    setIsGenerating,
  } = useHeroStore();

  const handleUseGuideline = (guidelinePrompt: string) => {
    setPrompt(guidelinePrompt);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGeneratedImages([]);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = (await res.json()) as {
        url?: string;
        error?: string;
        fallback?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      const { url, fallback } = data;
      if (!url) throw new Error("No image URL in response");

      const newImage = {
        id: uuidv4(),
        url,
        prompt: prompt.trim(),
      };
      setGeneratedImages([newImage]);
      setSelectedBackgroundUrl(url);
      if (fallback) {
        console.info(fallback);
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Generation failed";
      alert(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Background</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="mb-2 block">Predefined prompts</Label>
          <div className="mb-3 flex flex-wrap gap-2">
            {PROMPT_GUIDELINES.map((g) => (
              <Button
                key={g.id}
                variant="outline"
                size="sm"
                onClick={() => handleUseGuideline(g.prompt)}
                className="text-left"
              >
                {g.name}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="prompt">Describe your hero visual</Label>
          <div className="mt-1 flex gap-2">
            <Input
              id="prompt"
              placeholder="Or type your own: isometric tech illustration, gradient..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </div>

        {generatedImages.length > 0 && (
          <div>
            <Label className="mb-2 block">Select background</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {generatedImages.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedBackgroundUrl(img.url)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedBackgroundUrl === img.url
                      ? "border-emerald-500 ring-2 ring-emerald-200"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.prompt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
