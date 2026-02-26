import { BackgroundGenerator } from "@/components/background-generator";
import { LogoUpload } from "@/components/logo-upload";
import { TextInput } from "@/components/text-input";
import { PreviewCanvas } from "@/components/preview-canvas";
import { ExportButton } from "@/components/export-button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-gray-200 bg-primary-100 py-8">
        <div className="mx-auto max-w-(--max-w-container) px-4 md:px-16 2xl:px-6">
          <p className="section-label">Hero Visual</p>
          <h1 className="section-title mt-1">AI Hero Visual Generator</h1>
          <p className="section-description mt-2">
            Generate brand-compliant hero images with AI backgrounds, logos, and
            text. Export production-ready 1080×1080 PNG.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-(--max-w-content) px-4 py-4 md:px-16 2xl:px-6">
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
            <div className="rounded-3xl border border-(--gray-200) bg-(--gray-100) p-6 shadow-sm transition-all duration-300 hover:bg-(--gray-50) md:p-8">
              <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
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
