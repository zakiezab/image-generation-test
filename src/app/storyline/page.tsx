import { StorylineFlow } from "../../components/storyline-flow";

export default function StorylinePage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-gray-200 bg-secondary-800 py-8">
        <div className="mx-auto max-w-(--max-w-container) px-4 md:px-16 2xl:px-6">
          <p className="section-label">Storyline Studio</p>
          <h1 className="section-title mt-1">Scene-by-scene product demos</h1>
          <p className="section-description mt-2">
            Create scene-by-scene product demo scripts. Start from a voiceover, build from
            scratch (Why / How / What), or upload a screen recording.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-(--max-w-content) px-4 py-4 md:px-16 2xl:px-6">
        <StorylineFlow />
      </main>
    </div>
  );
}
