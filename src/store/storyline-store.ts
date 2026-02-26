"use client";

import { create } from "zustand";
import type {
  StorylineInputType,
  ScratchInput,
  StorylineScene,
  StorylineState,
} from "@/lib/storyline-types";
import { createSceneFromPayload } from "@/lib/storyline-types";
import { v4 as uuidv4 } from "uuid";

export interface StorylineStore extends StorylineState {
  setInputType: (type: StorylineInputType | null) => void;
  setVoiceoverScript: (script: string) => void;
  setScratchInput: (input: Partial<ScratchInput>) => void;
  setRecordingDescription: (desc: string) => void;
  setScenes: (scenes: StorylineScene[]) => void;
  setSceneImage: (sceneId: string, imageUrl: string) => void;
  setSceneGeneratingImage: (sceneId: string, value: boolean) => void;
  setRegenerationComments: (sceneId: string, comments: string) => void;
  setError: (error: string | null) => void;
  setIsGenerating: (value: boolean) => void;
  reset: () => void;
}

const initialScratch: ScratchInput = {
  why: "",
  how: "",
  what: "",
};

const initialState: StorylineState = {
  inputType: null,
  voiceoverScript: "",
  scratchInput: initialScratch,
  recordingDescription: "",
  scenes: [],
  isGenerating: false,
  error: null,
};

export const useStorylineStore = create<StorylineStore>((set) => ({
  ...initialState,

  setInputType: (inputType) => set({ inputType }),
  setVoiceoverScript: (voiceoverScript) => set({ voiceoverScript }),
  setScratchInput: (input) =>
    set((s) => ({
      scratchInput: { ...s.scratchInput, ...input },
    })),
  setRecordingDescription: (recordingDescription) => set({ recordingDescription }),
  setScenes: (scenes) => set({ scenes }),
  setSceneImage: (sceneId, imageUrl) =>
    set((s) => ({
      scenes: s.scenes.map((sc) =>
        sc.id === sceneId ? { ...sc, imageUrl, isGeneratingImage: false } : sc
      ),
    })),
  setSceneGeneratingImage: (sceneId, value) =>
    set((s) => ({
      scenes: s.scenes.map((sc) =>
        sc.id === sceneId ? { ...sc, isGeneratingImage: value } : sc
      ),
    })),
  setRegenerationComments: (sceneId, comments) =>
    set((s) => ({
      scenes: s.scenes.map((sc) =>
        sc.id === sceneId ? { ...sc, regenerationComments: comments } : sc
      ),
    })),
  setError: (error) => set({ error }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  reset: () => set(initialState),
}));

export function createScene(partial: Partial<StorylineScene> & { index: number }): StorylineScene {
  return createSceneFromPayload(partial.index, { id: uuidv4(), ...partial });
}
