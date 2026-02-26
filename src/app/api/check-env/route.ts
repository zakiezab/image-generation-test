import { NextResponse } from "next/server";

/**
 * GET /api/check-env – Check if image API keys are visible to the server.
 * Open http://localhost:3000/api/check-env to verify .env.local is loaded.
 * Restart the dev server after changing .env.local.
 */
export async function GET() {
  const google = process.env.GOOGLE_AI_API_KEY;
  const openai = process.env.OPENAI_API_KEY;
  return NextResponse.json({
    GOOGLE_AI_API_KEY: google?.trim() ? "set" : "missing",
    OPENAI_API_KEY: openai?.trim() ? "set" : "missing",
    hint: !google?.trim() && !openai?.trim()
      ? "Add one of these to .env.local and restart the dev server (npm run dev)."
      : undefined,
  });
}
