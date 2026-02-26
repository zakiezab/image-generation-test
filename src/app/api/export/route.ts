import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { BRAND } from "@/lib/brand";

/**
 * Server-side PNG export
 * Composes background, logo, title, description into 1080x1080 PNG
 */
/** Resolve relative URLs (e.g. /logo/foo.png) to absolute so server fetch works. */
function resolveUrl(url: string, request: NextRequest): string {
  if (url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("http")) {
    return url;
  }
  if (url.startsWith("/")) {
    const origin = new URL(request.url).origin;
    return `${origin}${url}`;
  }
  return url;
}

export async function POST(request: NextRequest) {
  try {
    const { backgroundUrl, logoUrl, logoPosition, logoScale, logoPadding, title, description } =
      await request.json();

    const size = BRAND.canvasSize;

    // Create base - background or solid color
    let base = sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 18, g: 18, b: 18, alpha: 1 },
      },
    });

    if (backgroundUrl) {
      if (backgroundUrl.startsWith("blob:")) {
        return NextResponse.json(
          { error: "Background image is not available for export. Generate a new background and try again." },
          { status: 400 }
        );
      }
      let bgBuffer: Buffer;
      if (backgroundUrl.startsWith("data:")) {
        const base64 = backgroundUrl.split(",")[1];
        bgBuffer = Buffer.from(base64 || "", "base64");
      } else {
        try {
          const url = resolveUrl(backgroundUrl, request);
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Background fetch: ${res.status}`);
          const arrBuf = await res.arrayBuffer();
          bgBuffer = Buffer.from(new Uint8Array(arrBuf));
        } catch (e) {
          throw new Error(
            "Could not load background image. If you used a placeholder, generate a new image first."
          );
        }
      }
      const bgImage = sharp(bgBuffer).resize(size, size, { fit: "cover" });
      base = sharp(await bgImage.toBuffer());
    }

    const svgParts: string[] = [];

    // Add logo if present
    if (logoUrl) {
      if (logoUrl.startsWith("blob:")) {
        return NextResponse.json(
          { error: "Logo is not available for export. Re-upload the logo and try again." },
          { status: 400 }
        );
      }
      let logoBuffer: Buffer;
      if (logoUrl.startsWith("data:")) {
        const base64 = logoUrl.split(",")[1];
        logoBuffer = Buffer.from(base64 || "", "base64");
      } else {
        try {
          const url = resolveUrl(logoUrl, request);
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Logo fetch: ${res.status}`);
          const arrBuf = await res.arrayBuffer();
          logoBuffer = Buffer.from(new Uint8Array(arrBuf));
        } catch (e) {
          throw new Error("Could not load logo image. Re-upload the logo and try again.");
        }
      }
      const logoMeta = await sharp(logoBuffer).metadata();
      const logoW = Math.min(
        (logoMeta.width || 100) * logoScale,
        BRAND.logoMaxWidth
      );
      const logoH = (logoMeta.height || 50) * logoScale * (logoW / (logoMeta.width || 100));
      const pad = typeof logoPadding === "number" ? logoPadding : BRAND.logoPadding;

      const positions: Record<string, { x: number; y: number }> = {
        "top-left": { x: pad, y: pad },
        "top-right": { x: size - logoW - pad, y: pad },
        "bottom-left": { x: pad, y: size - logoH - pad },
        "bottom-right": { x: size - logoW - pad, y: size - logoH - pad },
      };
      const pos = positions[logoPosition] || positions["bottom-right"];

      const logoBase64 = logoBuffer.toString("base64");
      const logoExt = logoUrl.includes("png") ? "png" : "jpeg";
      svgParts.push(`
        <image href="data:image/${logoExt};base64,${logoBase64}" 
          x="${pos.x}" y="${pos.y}" width="${logoW}" height="${logoH}" />
      `);
    }

    // Add title and description: middle-left, vertically centered block (multiline)
    const textPad = BRAND.titleDescriptionPadding;
    const titleLineHeight = BRAND.titleSize;
    const descLineHeight = BRAND.descriptionSize * 1.3;
    const gap = 50;
    const titleLines = title ? title.split(/\r?\n/) : [];
    const descLines = description ? description.split(/\r?\n/) : [];
    const titleBlockHeight = titleLines.length ? titleLines.length * titleLineHeight : 0;
    const descBlockHeight = descLines.length ? descLines.length * descLineHeight : 0;
    const blockHeight = titleBlockHeight + (titleLines.length && descLines.length ? gap : 0) + descBlockHeight;
    const blockTopY = (size - blockHeight) / 2;

    let lineY = blockTopY;
    for (const line of titleLines) {
      if (line.trim() === "") {
        lineY += titleLineHeight;
        continue;
      }
      svgParts.push(`
        <text x="${textPad}" y="${lineY}" 
          font-family="Arial, sans-serif" font-size="${BRAND.titleSize}" 
          font-weight="600" fill="white" dominant-baseline="hanging" text-anchor="start">${escapeXml(line.trim())}</text>
      `);
      lineY += titleLineHeight;
    }
    if (titleLines.length && descLines.length) lineY += gap;
    for (const line of descLines) {
      if (line.trim() === "") {
        lineY += descLineHeight;
        continue;
      }
      svgParts.push(`
        <text x="${textPad}" y="${lineY}" 
          font-family="Arial, sans-serif" font-size="${BRAND.descriptionSize}" 
          fill="rgba(255,255,255,0.85)" dominant-baseline="hanging" text-anchor="start">${escapeXml(line.trim())}</text>
      `);
      lineY += descLineHeight;
    }

    let result = base;
    if (svgParts.length > 0) {
      const svg = `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          ${svgParts.join("")}
        </svg>
      `;
      const overlay = await sharp(Buffer.from(svg)).png().toBuffer();
      result = base.composite([{ input: overlay, top: 0, left: 0 }]);
    }

    const pngBuffer = await result.png().toBuffer();

    return new NextResponse(new Uint8Array(pngBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": "attachment; filename=hero-visual.png",
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to export image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
