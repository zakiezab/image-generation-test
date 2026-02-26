"use client";

import { useState } from "react";
import type { StorylineInputType } from "@/lib/storyline-types";
import { useStorylineStore } from "@/store/storyline-store";
import { StorylineInputChoice } from "@/components/storyline-input-choice";
import { StorylineScratchForm } from "@/components/storyline-scratch-form";
import { StorylineVoiceoverForm } from "@/components/storyline-voiceover-form";
import { StorylineRecordingForm } from "@/components/storyline-recording-form";
import { StorylineScenes } from "@/components/storyline-scenes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StorylineFlow() {
  const [recordingFile, setRecordingFile] = useState<File | null>(null);
  const {
    inputType,
    setInputType,
    voiceoverScript,
    scratchInput,
    scenes,
    isGenerating,
    error,
    setError,
    setScenes,
    setIsGenerating,
  } = useStorylineStore();

  const canGenerate =
    (inputType === "voiceover" && voiceoverScript.trim()) ||
    (inputType === "scratch" &&
      scratchInput.why.trim() &&
      scratchInput.how.trim() &&
      scratchInput.what.trim()) ||
    (inputType === "recording" && recordingFile !== null);

  const handleGenerate = async () => {
    if (!canGenerate || !inputType) return;
    setError(null);
    setIsGenerating(true);
    try {
      let res: Response;
      if (inputType === "recording" && recordingFile) {
        const form = new FormData();
        form.append("inputType", inputType);
        form.append("recording", recordingFile);
        res = await fetch("/api/storyline/generate", {
          method: "POST",
          body: form,
        });
      } else {
        res = await fetch("/api/storyline/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inputType,
            voiceoverScript,
            scratchInput,
          }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      setScenes(data.scenes || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>1. Choose how to start</CardTitle>
        </CardHeader>
        <CardContent>
          <StorylineInputChoice
            value={inputType}
            onChange={(v: StorylineInputType) => {
              setInputType(v);
              if (v !== "recording") setRecordingFile(null);
            }}
          />
        </CardContent>
      </Card>

      {inputType === "voiceover" && (
        <Card>
          <CardHeader>
            <CardTitle>2. Paste your voiceover script</CardTitle>
          </CardHeader>
          <CardContent>
            <StorylineVoiceoverForm />
          </CardContent>
        </Card>
      )}

      {inputType === "scratch" && (
        <Card>
          <CardHeader>
            <CardTitle>2. Build from scratch (Why → How → What)</CardTitle>
          </CardHeader>
          <CardContent>
            <StorylineScratchForm />
          </CardContent>
        </Card>
      )}

      {inputType === "recording" && (
        <Card>
          <CardHeader>
            <CardTitle>2. Upload your screen recording</CardTitle>
          </CardHeader>
          <CardContent>
            <StorylineRecordingForm
              file={recordingFile}
              onFileChange={setRecordingFile}
            />
          </CardContent>
        </Card>
      )}

      {inputType && (
        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            className="w-full sm:w-auto"
          >
            {isGenerating ? "Generating scenes…" : "Generate scene-by-scene storyline"}
          </Button>
          {error && (
            <p className="text-sm text-primary" role="alert">
              {error}
            </p>
          )}
        </div>
      )}

      {scenes.length > 0 && (
        <div>
          <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
            Scenes (WHY → HOW → WHAT)
          </h2>
          <StorylineScenes />
        </div>
      )}
    </div>
  );
}
