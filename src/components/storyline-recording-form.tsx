"use client";

import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const MAX_VIDEO_MB = 50;
const ACCEPT = "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov";

export function StorylineRecordingForm({
  file,
  onFileChange,
}: {
  file: File | null;
  onFileChange: (f: File | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_VIDEO_MB * 1024 * 1024) {
      alert(`Please choose a video under ${MAX_VIDEO_MB}MB.`);
      e.target.value = "";
      return;
    }
    onFileChange(f);
    e.target.value = "";
  };

  return (
    <div>
      <Label className="mb-2 block">Upload screen recording</Label>
      <p className="mb-2 text-xs text-(--gray-500)">
        Upload a video file (e.g. .mp4, .webm). We’ll analyze it and generate a scene-by-scene storyline. Max {MAX_VIDEO_MB}MB. The file is processed and not stored.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={handleChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          {file ? "Change video" : "Choose video"}
        </Button>
        {file && (
          <span className="text-sm text-secondary-100">
            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </span>
        )}
      </div>
    </div>
  );
}
