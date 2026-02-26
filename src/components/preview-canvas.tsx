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

    // Clear
    ctx.fillStyle = "#121212";
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

    // Title & Description: middle-left, vertically centered block
    const textPad = BRAND.titleDescriptionPadding * scale;
    const titleLineHeight = BRAND.titleSize * scale;
    const descLineHeight = BRAND.descriptionSize * scale * 1.3;
    const gap = 50 * scale;
    const blockHeight = titleLineHeight + gap + descLineHeight;
    const blockTopY = (CANVAS_SIZE - blockHeight) / 2;

    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const maxTextWidth = CANVAS_SIZE - textPad * 2;

    ctx.font = `600 ${BRAND.titleSize * scale}px "Libre Franklin", sans-serif`;
    ctx.fillStyle = "white";
    let y = drawMultilineText(ctx, title, textPad, blockTopY, maxTextWidth, titleLineHeight);

    y += gap;
    ctx.font = `${BRAND.descriptionSize * scale}px "Libre Franklin", sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    drawMultilineText(ctx, description, textPad, y, maxTextWidth, descLineHeight);
  }, [
    bgImage,
    logoImage,
    logoPosition,
    logoScale,
    logoPadding,
    title,
    description,
  ]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded-xl overflow-hidden border-2 border-zinc-200 shadow-lg bg-zinc-100">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="block"
        />
      </div>
      <p className="text-xs text-zinc-500">Live preview • Export: 1080×1080</p>
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
