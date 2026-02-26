"use client";

import { useEffect, useRef, useState } from "react";
import { useHeroStore } from "@/store/hero-store";
import { BRAND } from "@/lib/brand";

const CANVAS_SIZE = 400; // Preview size
const EXPORT_SIZE = 1080;

export function PreviewCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    selectedBackgroundUrl,
    logoUrl,
    logoPosition,
    logoScale,
    logoPadding,
    title,
    description,
    backgroundError,
  } = useHeroStore();

  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!selectedBackgroundUrl) {
      setBgImage(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setBgImage(img);
    img.src = selectedBackgroundUrl;
    return () => {
      img.onload = null;
      setBgImage(null);
    };
  }, [selectedBackgroundUrl]);

  useEffect(() => {
    if (!logoUrl) {
      setLogoImage(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setLogoImage(img);
    img.src = logoUrl;
    return () => {
      img.onload = null;
      setLogoImage(null);
    };
  }, [logoUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = CANVAS_SIZE / EXPORT_SIZE;

    const draw = () => {
      // Clear
      ctx.fillStyle = "#fafafa";
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Background
      if (bgImage) {
        ctx.drawImage(bgImage, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
      }

      // Logo
      if (logoImage) {
        const maxW = BRAND.logoMaxWidth * scale * logoScale;
        const maxH = BRAND.logoMaxHeight * scale * logoScale;
        const aspect = logoImage.width / logoImage.height;
        let w = maxW;
        let h = maxW / aspect;
        if (h > maxH) {
          h = maxH;
          w = maxH * aspect;
        }
        const pad = logoPadding * scale;

        const positions: Record<string, [number, number]> = {
          "top-left": [pad, pad],
          "top-right": [CANVAS_SIZE - w - pad, pad],
          "bottom-left": [pad, CANVAS_SIZE - h - pad],
          "bottom-right": [CANVAS_SIZE - w - pad, CANVAS_SIZE - h - pad],
        };
        const [x, y] = positions[logoPosition] || positions["bottom-right"];
        ctx.drawImage(logoImage, x, y, w, h);
      }

      // Title & Description: title 313px from top (export coords), 64px gap (export coords)
      const textPad = BRAND.titleDescriptionPadding * scale;
      const titleLineHeight = BRAND.titleSize * scale;
      const descLineHeight = BRAND.descriptionSize * scale * 1.3;
      const titleTopExport = 313;
      const gapExport = 64;
      const titleTopY = titleTopExport * scale;
      const gap = gapExport * scale;

      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const maxTextWidth = CANVAS_SIZE - textPad * 2;

      const titleText = String(title ?? "");
      const descText = String(description ?? "");

      ctx.font = `600 ${BRAND.titleSize * scale}px system-ui, sans-serif`;
      ctx.fillStyle = "#E8E3FF";
      let y = drawMultilineText(ctx, titleText, textPad, titleTopY, maxTextWidth, titleLineHeight);

      y += gap;
      ctx.font = `${BRAND.descriptionSize * scale}px system-ui, sans-serif`;
      ctx.fillStyle = "#E8E3FF";
      drawMultilineText(ctx, descText, textPad, y, maxTextWidth, descLineHeight);
    };

    // Run draw on next frame so we have the latest title/description after React commit
    const raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [
    bgImage,
    logoImage,
    logoPosition,
    logoScale,
    logoPadding,
    title,
    description,
  ]);

  const isEmpty =
    !selectedBackgroundUrl &&
    !logoUrl &&
    !title.trim() &&
    !description.trim();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative rounded-xl overflow-hidden border-2 border-(--gray-200) shadow-lg bg-(--gray-100)">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="block"
        />
        {backgroundError ? (
          <div
            className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-red-600 bg-red-50/95"
            role="alert"
          >
            {backgroundError}
          </div>
        ) : isEmpty ? (
          <div
            className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-gray-400"
            aria-hidden
          >
            Your hero visual will appear here
          </div>
        ) : null}
      </div>
      <p className="text-xs text-gray-500">Live preview • Export: 1080×1080</p>
    </div>
  );
}

/** Draws text with word wrap; returns the Y position after the last line. */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, currentY);
  return currentY + lineHeight;
}

/** Splits by newlines, draws each paragraph with word wrap; returns Y after last line. */
function drawMultilineText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const lines = text.split(/\r?\n/);
  let currentY = y;
  for (const line of lines) {
    currentY = wrapText(ctx, line.trim(), x, currentY, maxWidth, lineHeight);
  }
  return currentY;
}
