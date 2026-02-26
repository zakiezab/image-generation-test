# AI Hero Visual Generator

A brand-compliant platform for generating AI hero visuals. Create backgrounds with AI, add your logo and text, preview in real-time, and export production-ready 1080×1080 PNG images.

## Features

### Hero Visual (default)
- **AI Background Generation** – Describe your hero visual, generate with Google Imagen / OpenAI DALL-E (or placeholder)
- **Logo Upload & Placement** – Upload logos, position, scale, and padding
- **Title & Description** – Manual input or AI-generated copy
- **Brand Enforcement** – Libre Franklin font, locked sizes, layout, and padding
- **Live Preview** – Real-time canvas updates
- **Export** – Server-side 1080×1080 PNG via Sharp

### Storyline Studio
- **Scene-by-scene product demo scripts** – Start from a voiceover script (paste or upload file), build from scratch (Why / How / What), or upload a screen recording video
- **Per-scene fields** – Title, description, voiceover script, suggested visuals, summary
- **Generate visuals** – Use existing Google AI (Imagen) to generate an image per scene
- **Re-generate with comments** – Refine any scene with feedback; supports Claude, Gemini, or OpenAI for text

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Zustand** (state)
- **Sharp** (server-side export)
- **HTML Canvas** (live preview)

## Getting Started

```bash
npm install
cp .env.example .env.local
# Add OPENAI_API_KEY for AI image/text generation
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GOOGLE_AI_API_KEY` | Google AI: Imagen (hero images), Gemini (storyline text + hero title/description) |
| `ANTHROPIC_API_KEY` | Claude: storyline scene generation (tried first for Storyline Studio) |
| `OPENAI_API_KEY` | OpenAI: DALL-E images, GPT for title/description and storyline fallback |

Storyline Studio tries **Claude** first, then **Gemini**, then **OpenAI** for scene generation. Scene visuals use the same image API (Google Imagen when `GOOGLE_AI_API_KEY` is set). For **screen recording**, `GOOGLE_AI_API_KEY` is required (Gemini analyzes the video).

### Storage (MVP)

No persistent file storage is used. Voiceover script files are read in the browser only. Uploaded screen recordings are written to a temp file, sent to Gemini for analysis, then the temp file is deleted. If you later need to keep recordings or scripts, you can add S3/Cloudinary (or similar).

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate-image/   # AI background generation
│   │   ├── generate-text/    # AI title/description
│   │   ├── storyline/       # generate, regenerate-scene
│   │   ├── upload/           # Logo upload
│   │   └── export/           # PNG export
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── background-generator.tsx
│   ├── logo-upload.tsx
│   ├── text-input.tsx
│   ├── preview-canvas.tsx
│   ├── export-button.tsx
│   └── ui/
├── lib/
│   └── brand.ts              # Brand enforcement constants
└── store/
    └── hero-store.ts         # Zustand state
```

## Brand Rules (Enforced)

- Font: Libre Franklin
- Title size: 48px
- Description size: 20px
- Canvas: 1080×1080
- Padding: 48px
- Logo max: 200×80px
