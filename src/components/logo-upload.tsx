"use client";

import { useHeroStore } from "@/store/hero-store";
import { BRAND } from "@/lib/brand";
import { LOGO_OPTIONS } from "@/lib/logo-options";
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
  const {
    logoUrl,
    setLogoUrl,
    logoPosition,
    setLogoPosition,
    logoScale,
    setLogoScale,
    logoPadding,
    setLogoPadding,
    addToMediaLibrary,
  } = useHeroStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="mb-2 block">Select logo</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {LOGO_OPTIONS.map((logo) => (
              <button
                key={logo.id}
                type="button"
                onClick={() => {
                  applyLogoDefaults(setLogoUrl, setLogoPosition, setLogoScale, setLogoPadding, logo.path);
                  addToMediaLibrary(logo.path);
                }}
                className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-2 transition-all ${
                  logoUrl === logo.path ? "border-primary ring-2 ring-primary-100" : "border-(--gray-200) hover:border-secondary-300"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded">
                  <img src={logo.path} alt={logo.name} className="max-h-full max-w-full object-contain" />
                </div>
                <span className="text-xs font-medium text-secondary-100">{logo.name}</span>
              </button>
            ))}
          </div>
        </div>

        {logoUrl && (
          <>
            <div>
              <Label className="mb-1 block">Position</Label>
              <p className="mb-2 text-xs text-gray-500">Where the logo sits on the canvas (e.g. top-left, bottom-right).</p>
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
              <p className="mb-1 text-xs text-gray-500">Logo size multiplier (0.5x–2x). Default: 1.5x.</p>
              <p className="mb-1 text-sm font-medium text-secondary-100">{logoScale.toFixed(1)}x</p>
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
              <p className="mb-1 text-xs text-gray-500">Distance from the canvas edge in pixels. Default: 52px.</p>
              <p className="mb-1 text-sm font-medium text-secondary-100">{logoPadding}px</p>
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
