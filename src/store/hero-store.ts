import { create } from "zustand";
import type { LogoPosition } from "@/lib/brand";

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

export interface HeroState {
  // AI Background
  prompt: string;
  generatedImages: GeneratedImage[];
  selectedBackgroundUrl: string | null;
  isGenerating: boolean;
  backgroundError: string | null;

  // Logo
  logoUrl: string | null;
  logoPosition: LogoPosition;
  logoScale: number;
  logoPadding: number;

  // Text
  title: string;
  description: string;
  isGeneratingText: boolean;

  // Media library (uploaded logos)
  mediaLibrary: string[];

  // Actions
  setPrompt: (prompt: string) => void;
  setGeneratedImages: (images: GeneratedImage[]) => void;
  addGeneratedImage: (image: GeneratedImage) => void;
  setSelectedBackgroundUrl: (url: string | null) => void;
  setIsGenerating: (value: boolean) => void;
  setBackgroundError: (error: string | null) => void;

  setLogoUrl: (url: string | null) => void;
  setLogoPosition: (position: LogoPosition) => void;
  setLogoScale: (scale: number) => void;
  setLogoPadding: (padding: number) => void;

  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setIsGeneratingText: (value: boolean) => void;

  addToMediaLibrary: (url: string) => void;
  removeFromMediaLibrary: (url: string) => void;

  reset: () => void;
}

const initialState = {
  prompt: "",
  generatedImages: [],
  selectedBackgroundUrl: null as string | null,
  isGenerating: false,
  backgroundError: null as string | null,

  logoUrl: null as string | null,
  logoPosition: "bottom-right" as LogoPosition,
  logoScale: 1,
  logoPadding: 32,

  title: "",
  description: "",
  isGeneratingText: false,

  mediaLibrary: [] as string[],
};

export const useHeroStore = create<HeroState>((set) => ({
  ...initialState,

  setPrompt: (prompt) => set({ prompt }),
  setGeneratedImages: (generatedImages) => set({ generatedImages }),
  addGeneratedImage: (image) =>
    set((state) => ({
      generatedImages: [...state.generatedImages, image],
    })),
  setSelectedBackgroundUrl: (selectedBackgroundUrl) => set({ selectedBackgroundUrl }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setBackgroundError: (backgroundError) => set({ backgroundError }),

  setLogoUrl: (logoUrl) => set({ logoUrl }),
  setLogoPosition: (logoPosition) => set({ logoPosition }),
  setLogoScale: (logoScale) => set({ logoScale: Math.max(0.5, Math.min(2, logoScale)) }),
  setLogoPadding: (logoPadding) => set({ logoPadding }),

  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setIsGeneratingText: (isGeneratingText) => set({ isGeneratingText }),

  addToMediaLibrary: (url) =>
    set((state) => ({
      mediaLibrary: state.mediaLibrary.includes(url) ? state.mediaLibrary : [...state.mediaLibrary, url],
    })),
  removeFromMediaLibrary: (url) =>
    set((state) => ({
      mediaLibrary: state.mediaLibrary.filter((u) => u !== url),
    })),

  reset: () => set(initialState),
}));
