export type StorylineInputType = "voiceover" | "scratch" | "recording";

export interface ScratchInput {
  why: string;
  how: string;
  what: string;
}

export interface StorylineScene {
  id: string;
  index: number;
  title: string;
  description: string;
  voiceoverScript: string;
  suggestedVisuals: string;
  summary: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
  regenerationComments?: string;
}

export interface StorylineState {
  inputType: StorylineInputType | null;
  voiceoverScript: string;
  scratchInput: ScratchInput;
  recordingDescription: string;
  scenes: StorylineScene[];
  isGenerating: boolean;
  error: string | null;
}

export function createSceneFromPayload(
  index: number,
  payload: Partial<StorylineScene> & { id?: string }
): StorylineScene {
  return {
    id: payload.id ?? `scene-${index}`,
    index,
    title: "",
    description: "",
    voiceoverScript: "",
    suggestedVisuals: "",
    summary: "",
    ...payload,
  };
}
