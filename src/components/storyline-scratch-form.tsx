"use client";

import { useStorylineStore } from "@/store/storyline-store";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function StorylineScratchForm() {
  const { scratchInput, setScratchInput } = useStorylineStore();
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="why" className="mb-1 block">
          Why — Pain point / problem / purpose
        </Label>
        <p className="mb-2 text-xs text-gray-500">
          What problem does the product solve or what’s the cause?
        </p>
        <Textarea
          id="why"
          placeholder="e.g. Teams waste hours switching between tools…"
          value={scratchInput.why}
          onChange={(e) => setScratchInput({ why: e.target.value })}
          rows={3}
          className="w-full"
        />
      </div>
      <div>
        <Label htmlFor="how" className="mb-1 block">
          How — Solution / process
        </Label>
        <p className="mb-2 text-xs text-gray-500">
          How does the product work or what’s the process?
        </p>
        <Textarea
          id="how"
          placeholder="e.g. One dashboard connects all apps, single sign-on…"
          value={scratchInput.how}
          onChange={(e) => setScratchInput({ how: e.target.value })}
          rows={3}
          className="w-full"
        />
      </div>
      <div>
        <Label htmlFor="what" className="mb-1 block">
          What — The result
        </Label>
        <p className="mb-2 text-xs text-gray-500">
          What outcome or benefit do users get?
        </p>
        <Textarea
          id="what"
          placeholder="e.g. Save 5 hours per week, fewer errors…"
          value={scratchInput.what}
          onChange={(e) => setScratchInput({ what: e.target.value })}
          rows={3}
          className="w-full"
        />
      </div>
    </div>
  );
}
