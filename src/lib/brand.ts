/**
 * Brand Enforcement System
 * All values are locked for brand compliance
 */

export const BRAND = {
  // Typography - LibreFranklin
  fontFamily: "Libre Franklin, system-ui, sans-serif",

  // Font sizes (locked)
  titleSize: 64,
  descriptionSize: 48,

  // Layout
  canvasSize: 1080,
  padding: 48,
  titleDescriptionPadding: 98,

  // Logo constraints
  logoMaxWidth: 200,
  logoMaxHeight: 80,
  logoMinWidth: 60,
  logoMinHeight: 24,
  logoPadding: 32,

  // Logo positions
  positions: ["top-left", "top-right", "bottom-left", "bottom-right"] as const,
} as const;

export type LogoPosition = (typeof BRAND.positions)[number];
