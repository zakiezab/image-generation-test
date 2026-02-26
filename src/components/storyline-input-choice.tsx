"use client";

import type { StorylineInputType } from "@/lib/storyline-types";
import { Button } from "@/components/ui/button";

const options: { value: StorylineInputType; label: string; description: string }[] = [
  {
    value: "voiceover",
    label: "Add voiceover script",
    description: "Paste an existing script and we’ll break it into scenes.",
  },
  {
    value: "scratch",
    label: "Build from scratch",
    description: "Define Why (problem), How (solution), What (result) and we’ll generate the script.",
  },
  {
    value: "recording",
    label: "Upload screen recording",
    description: "Upload a video file; we’ll analyze it and generate a scene-by-scene storyline.",
  },
];

export function StorylineInputChoice({
  value,
  onChange,
}: {
  value: StorylineInputType | null;
  onChange: (v: StorylineInputType) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-xl border-2 p-4 text-left transition-colors ${
            value === opt.value
              ? "border-primary bg-primary-100"
              : "border-(--gray-200) bg-(--gray-100) hover:border-secondary-300"
          }`}
        >
          <span className="font-medium text-foreground">{opt.label}</span>
          <p className="mt-1 text-sm text-secondary-100">{opt.description}</p>
        </button>
      ))}
    </div>
  );
}
