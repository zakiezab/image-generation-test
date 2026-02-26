import { BackgroundGenerator } from "@/components/background-generator";
import { LogoUpload } from "@/components/logo-upload";
import { TextInput } from "@/components/text-input";
import { PreviewCanvas } from "@/components/preview-canvas";
import { ExportButton } from "@/components/export-button";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-zinc-900">
            AI Hero Visual Generator
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Generate brand-compliant hero images with AI backgrounds, logos, and
            text. Export production-ready 1080×1080 PNG.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left: Controls */}
          <div className="space-y-6">
            <BackgroundGenerator />
            <LogoUpload />
            <TextInput />
            <div className="pt-4">
              <ExportButton />
            </div>
          </div>

          {/* Right: Preview */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900">
                Live Preview
              </h2>
              <PreviewCanvas />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
