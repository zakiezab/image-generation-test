"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useHeroStore } from "@/store/hero-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Logos available for selection (from public/logo/)
const LOGO_OPTIONS = [
  { id: "logo-dark", path: "/logo/Logo-dark.png", name: "Logo Dark" },
  { id: "logo-light", path: "/logo/Logo-light.png", name: "Logo Light" },
  { id: "logo-v2-02", path: "/logo/Logo_v2_02.png", name: "Logo v2 02" },
  { id: "logo-v2-default", path: "/logo/Logo_v2_default.png", name: "Logo v2 Default" },
];

const LOGO_DEFAULTS = {
  position: "top-left" as const,
  scale: 1.5,
  padding: 52,
};

export default function LogoPage() {
  const router = useRouter();
  const {
    setLogoUrl,
    setLogoPosition,
    setLogoScale,
    setLogoPadding,
    addToMediaLibrary,
  } = useHeroStore();

  const handleSelect = (path: string) => {
    setLogoUrl(path);
    setLogoPosition(LOGO_DEFAULTS.position);
    setLogoScale(LOGO_DEFAULTS.scale);
    setLogoPadding(LOGO_DEFAULTS.padding);
    addToMediaLibrary(path);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-(--gray-200) bg-background">
        <div className="mx-auto max-w-(--max-w-container) px-4 py-6 md:px-16 2xl:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-secondary-100 hover:text-foreground"
            >
              ← Back
            </Link>
            <h1 className="font-display text-2xl font-bold text-foreground">Choose a logo</h1>
          </div>
          <p className="mt-1 text-sm text-secondary-100">
            Select a logo to use on your hero image. It will be applied on the
            main page.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-(--max-w-content) px-4 py-8 md:px-16 2xl:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Available logos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {LOGO_OPTIONS.map((logo) => (
                <button
                  key={logo.id}
                  type="button"
                  onClick={() => handleSelect(logo.path)}
                  className="flex flex-col items-center gap-2 rounded-lg border-2 border-(--gray-200) p-4 transition hover:border-primary hover:bg-(--gray-50)"
                >
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden">
                    <img
                      src={logo.path}
                      alt={logo.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <span className="text-sm font-medium text-secondary-100">
                    {logo.name}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-(--gray-200) bg-transparent px-4 text-sm font-medium text-foreground transition-colors hover:bg-(--gray-100) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Cancel and go back
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
