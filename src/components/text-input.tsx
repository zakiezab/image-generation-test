"use client";

import { useHeroStore } from "@/store/hero-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TextInput() {
  const {
    title,
    setTitle,
    description,
    setDescription,
    isGeneratingText,
    setIsGeneratingText,
    prompt,
    selectedBackgroundUrl,
  } = useHeroStore();

  const handleGenerateWithAI = async () => {
    setIsGeneratingText(true);
    try {
      const context = [prompt, selectedBackgroundUrl ? "Hero image selected" : ""]
        .filter(Boolean)
        .join(". ");

      const res = await fetch("/api/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, type: "both" }),
      });

      const data = (await res.json()) as {
        title?: string;
        description?: string;
        error?: string;
      };

      if (!res.ok) {
        alert(data.error || "Failed to generate text");
        return;
      }

      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (!data.title && !data.description) {
        alert("No title or description was returned. Try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Check the console for details.");
    } finally {
      setIsGeneratingText(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Title & Description</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Textarea
            id="title"
            placeholder="Your headline (multiple lines allowed)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 min-h-[80px] resize-y"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Supporting copy"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1"
            rows={2}
          />
        </div>

        <Button
          variant="outline"
          onClick={handleGenerateWithAI}
          disabled={isGeneratingText}
        >
          {isGeneratingText ? "Generating..." : "Generate with AI"}
        </Button>
      </CardContent>
    </Card>
  );
}
