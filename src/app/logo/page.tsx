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

export default function LogoPage() {
  const router = useRouter();
  const { setLogoUrl, addToMediaLibrary } = useHeroStore();

  const handleSelect = (path: string) => {
    setLogoUrl(path);
    addToMediaLibrary(path);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-zinc-900">Choose a logo</h1>
          </div>
          <p className="mt-1 text-sm text-zinc-600">
            Select a logo to use on your hero image. It will be applied on the
            main page.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
                  className="flex flex-col items-center gap-2 rounded-lg border-2 border-zinc-200 p-4 transition hover:border-emerald-500 hover:bg-zinc-50"
                >
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden">
                    <img
                      src={logo.path}
                      alt={logo.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <span className="text-sm font-medium text-zinc-700">
                    {logo.name}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 bg-transparent px-4 text-sm font-medium transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
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
