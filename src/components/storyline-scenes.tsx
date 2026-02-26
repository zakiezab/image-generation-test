"use client";

import { useState } from "react";
import { useStorylineStore } from "@/store/storyline-store";
import type { StorylineScene } from "@/lib/storyline-types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function StorylineScenes() {
  const { scenes } = useStorylineStore();
  return (
    <div className="space-y-6">
      {scenes.map((scene) => (
        <SceneCard key={scene.id} scene={scene} />
      ))}
    </div>
  );
}

function SceneCard({ scene }: { scene: StorylineScene }) {
  const [showRegenerate, setShowRegenerate] = useState(false);
  const [comments, setComments] = useState(scene.regenerationComments ?? "");
  const [adjustingField, setAdjustingField] = useState<"description" | "voiceover" | null>(null);
  const {
    setSceneImage,
    setSceneGeneratingImage,
    setScenes,
    setRegenerationComments,
    scenes,
  } = useStorylineStore();

  const handleAdjustLength = async (
    field: "description" | "voiceover",
    direction: "shorten" | "expand"
  ) => {
    setAdjustingField(field);
    try {
      const instruction =
        field === "description"
          ? direction === "shorten"
            ? "Make the description shorter and more concise. Keep everything else unchanged."
            : "Expand the description with a bit more detail. Keep everything else unchanged."
          : direction === "shorten"
            ? "Make the voiceover script shorter and more concise. Keep everything else unchanged."
            : "Expand the voiceover script with more detail. Keep everything else unchanged.";
      const res = await fetch("/api/storyline/regenerate-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sceneId: scene.id, comments: instruction, scene }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      const updated = scenes.map((s) => (s.id === scene.id ? data.scene : s));
      setScenes(updated);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setAdjustingField(null);
    }
  };

  const handleGenerateVisual = async () => {
    setSceneGeneratingImage(scene.id, true);
    try {
      const prompt = `Title: ${scene.title}. Description: ${scene.description}. Visual style: ${scene.suggestedVisuals}. Simple motion graphics, clean and professional.`;
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          context: "storyline",
          aspectRatio: "16:9",
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) setSceneImage(scene.id, data.url);
    } finally {
      setSceneGeneratingImage(scene.id, false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerationComments(scene.id, comments);
    try {
      const res = await fetch("/api/storyline/regenerate-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneId: scene.id,
          comments,
          scene,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Regeneration failed");
      const updated = scenes.map((s) => (s.id === scene.id ? data.scene : s));
      setScenes(updated);
      setShowRegenerate(false);
      setComments("");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to regenerate");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Scene {scene.index}: {scene.title}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRegenerate((v) => !v)}
          >
            {showRegenerate ? "Cancel" : "Re-generate"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 md:flex-row md:items-start">
        {/* Left: details */}
        <div className="min-w-0 flex-1 space-y-4 md:border-r md:border-(--gray-200) md:pr-6">
          {showRegenerate && (
            <div className="rounded-lg border border-(--gray-200) bg-secondary-800/40 p-4">
              <Label className="mb-2 block text-foreground">Add comments for re-generation</Label>
              <Textarea
                placeholder="e.g. Shorten the voiceover, make the visuals more technical…"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={2}
                className="mb-2 w-full"
              />
              <Button size="sm" onClick={handleRegenerate}>
                Re-generate this scene
              </Button>
            </div>
          )}

          {scene.description && (
            <div>
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs text-(--gray-500)">Description</Label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={adjustingField !== null}
                    onClick={() => handleAdjustLength("description", "shorten")}
                  >
                    {adjustingField === "description" ? "…" : "Shorten"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={adjustingField !== null}
                    onClick={() => handleAdjustLength("description", "expand")}
                  >
                    Expand
                  </Button>
                </div>
              </div>
              <p className="mt-1 text-sm text-(--gray-700)">{scene.description}</p>
            </div>
          )}

          {scene.voiceoverScript && (
            <div>
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs text-(--gray-500)">Voiceover script</Label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={adjustingField !== null}
                    onClick={() => handleAdjustLength("voiceover", "shorten")}
                  >
                    {adjustingField === "voiceover" ? "…" : "Shorten"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={adjustingField !== null}
                    onClick={() => handleAdjustLength("voiceover", "expand")}
                  >
                    Expand
                  </Button>
                </div>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-(--gray-700)">
                {scene.voiceoverScript}
              </p>
            </div>
          )}

          {scene.suggestedVisuals && (
            <div>
              <Label className="text-xs text-(--gray-500)">Suggested visuals / animation</Label>
              <p className="mt-1 text-sm text-(--gray-700)">{scene.suggestedVisuals}</p>
            </div>
          )}

          {scene.summary && (
            <div>
              <Label className="text-xs text-(--gray-500)">Summary</Label>
              <p className="mt-1 text-sm text-(--gray-600)">{scene.summary}</p>
            </div>
          )}
        </div>

        {/* Right: visuals */}
        <div className="shrink-0 md:w-80">
          <Label className="mb-2 block text-xs text-(--gray-500)">Visuals</Label>
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-(--gray-200) bg-(--gray-100)">
            {scene.imageUrl ? (
              <img
                src={scene.imageUrl}
                alt={scene.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-(--gray-500)">
                {scene.isGeneratingImage ? (
                  <span className="text-sm">Generating…</span>
                ) : (
                  <span className="text-sm">No visual yet</span>
                )}
              </div>
            )}
          </div>
          <Button
            variant="primary"
            size="sm"
            className="mt-2 w-full"
            onClick={handleGenerateVisual}
            disabled={scene.isGeneratingImage}
          >
            {scene.isGeneratingImage
              ? "Generating…"
              : "Generate visuals for this scene"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
