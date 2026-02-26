"use client";

import { useRef } from "react";
import { useStorylineStore } from "@/store/storyline-store";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function StorylineVoiceoverForm() {
  const { voiceoverScript, setVoiceoverScript } = useStorylineStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setVoiceoverScript(text);
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="voiceover" className="mb-2 block">
          Voiceover script
        </Label>
        <p className="mb-2 text-xs text-(--gray-500)">
          Paste below or upload a script file (.txt, .md). Files are read in the browser and not stored on the server.
        </p>
        <div className="mb-2 flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload script file
          </Button>
        </div>
        <Textarea
          id="voiceover"
          placeholder="Paste your full voiceover or script here…"
          value={voiceoverScript}
          onChange={(e) => setVoiceoverScript(e.target.value)}
          rows={10}
          className="w-full"
        />
      </div>
    </div>
  );
}
