# AI Hero Visual Generator

A brand-compliant platform for generating AI hero visuals. Create backgrounds with AI, add your logo and text, preview in real-time, and export production-ready 1080×1080 PNG images.

## Features

- **AI Background Generation** – Describe your hero visual, generate with OpenAI DALL-E (or placeholder when no API key)
- **Logo Upload & Placement** – Upload logos, position (top-left, top-right, bottom-left, bottom-right), scale, and padding
- **Title & Description** – Manual input or AI-generated copy
- **Brand Enforcement** – Libre Franklin font, locked sizes, layout, and padding
- **Live Preview** – Real-time canvas updates
- **Export** – Server-side 1080×1080 PNG via Sharp

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
| `OPENAI_API_KEY` | OpenAI API key for DALL-E image generation and GPT text generation |

Without `OPENAI_API_KEY`, the app uses placeholder images (picsum.photos) and fallback text.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate-image/   # AI background generation
│   │   ├── generate-text/    # AI title/description
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
