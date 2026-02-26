"use client";

import { useRef } from "react";
import Link from "next/link";
import { useHeroStore } from "@/store/hero-store";
import { BRAND } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LOGO_DEFAULTS = {
  position: "top-left" as const,
  scale: 1.5,
  padding: 52,
};

function applyLogoDefaults(
  setLogoUrl: (url: string) => void,
  setLogoPosition: (p: "top-left" | "top-right" | "bottom-left" | "bottom-right") => void,
  setLogoScale: (s: number) => void,
  setLogoPadding: (p: number) => void,
  url: string
) {
  setLogoUrl(url);
  setLogoPosition(LOGO_DEFAULTS.position);
  setLogoScale(LOGO_DEFAULTS.scale);
  setLogoPadding(LOGO_DEFAULTS.padding);
}

export function LogoUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    logoUrl,
    setLogoUrl,
    logoPosition,
    setLogoPosition,
    logoScale,
    setLogoScale,
    logoPadding,
    setLogoPadding,
    mediaLibrary,
    addToMediaLibrary,
  } = useHeroStore();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: dataUrl }),
        });
        if (res.ok) {
          const { url } = await res.json();
          applyLogoDefaults(setLogoUrl, setLogoPosition, setLogoScale, setLogoPadding, url);
          addToMediaLibrary(url);
        }
      } catch {
        applyLogoDefaults(setLogoUrl, setLogoPosition, setLogoScale, setLogoPadding, dataUrl);
        addToMediaLibrary(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="mb-2 block">Upload or select</Label>
          <div className="flex gap-2 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Logo
            </Button>
            <Link
              href="/logo"
              className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-300 bg-transparent px-3 text-sm font-medium transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
            >
              Choose from library
            </Link>
            {mediaLibrary.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {mediaLibrary.map((url) => (
                  <button
                    key={url.slice(0, 50)}
                    type="button"
                    onClick={() =>
                      applyLogoDefaults(setLogoUrl, setLogoPosition, setLogoScale, setLogoPadding, url)
                    }
                    className={`w-12 h-12 rounded border-2 overflow-hidden shrink-0 ${
                      logoUrl === url ? "border-emerald-500" : "border-zinc-200"
                    }`}
                  >
                    <img src={url} alt="Logo" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {logoUrl && (
          <>
            <div>
              <Label className="mb-1 block">Position</Label>
              <p className="mb-2 text-xs text-zinc-500">Where the logo sits on the canvas (e.g. top-left, bottom-right).</p>
              <div className="grid grid-cols-4 gap-2">
                {BRAND.positions.map((pos) => (
                  <Button
                    key={pos}
                    variant={logoPosition === pos ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setLogoPosition(pos)}
                  >
                    {pos.replace("-", " ")}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="scale" className="block mb-1">
                Scale
              </Label>
              <p className="mb-1 text-xs text-zinc-500">Logo size multiplier (0.5x–2x). Default: 1.5x.</p>
              <p className="mb-1 text-sm font-medium text-zinc-700">{logoScale.toFixed(1)}x</p>
              <input
                id="scale"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={logoScale}
                onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="padding" className="block mb-1">
                Padding
              </Label>
              <p className="mb-1 text-xs text-zinc-500">Distance from the canvas edge in pixels. Default: 52px.</p>
              <p className="mb-1 text-sm font-medium text-zinc-700">{logoPadding}px</p>
              <input
                id="padding"
                type="range"
                min="16"
                max="64"
                step="4"
                value={logoPadding}
                onChange={(e) => setLogoPadding(parseInt(e.target.value, 10))}
                className="w-full"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
