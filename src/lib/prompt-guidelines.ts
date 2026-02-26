/**
 * Predefined prompt guidelines for hero visual generation
 * Based on brand-compliant isometric tech illustrations with:
 * - Dark blue/purple gradient backgrounds
 * - Clean vector style, negative space for text overlay
 * - Objects positioned in lower-right quadrant
 */

export const PROMPT_GUIDELINES = [
  {
    id: "data-visualization",
    name: "Data & Analytics",
    prompt:
      "Isometric vector illustration of abstract data visualization: smartphone screens displaying line charts and pie charts, stacked bar chart cubes in light pink, red, and lavender. Smooth dark blue to purple gradient background with subtle rounded abstract shapes in upper right. Clean lines, modern digital art style. Objects in lower right, ample negative space in upper left for text overlay.",
  },
  {
    id: "laptop-workspace",
    name: "Laptop & Workspace",
    prompt:
      "Isometric vector illustration of an open laptop with light pink body, white keys, and bold red trackpad. Dark blue to purple radial gradient background with subtle abstract curved shapes in top right. Laptop in lower right quadrant on dark reflective surface with stylized blocky reflection. Clean outlined style, modern, professional tech aesthetic.",
  },
  {
    id: "cloud-infrastructure",
    name: "Cloud & Servers",
    prompt:
      "Isometric illustration of cloud infrastructure: server units with cooling fans and vents, stacked storage bays, abstract network nodes connected by thin red lines. Deep indigo to violet gradient background. Light gray device bodies with dark outlines. Objects in bottom-right, significant negative space in upper left for branding.",
  },
  {
    id: "computing-power",
    name: "Computing & Energy",
    prompt:
      "Isometric illustration of two stacked computing units with glowing pink pipeline connecting them. White lightning arcs around top device. Dark blue to rich purple gradient background with abstract rounded shapes. Light gray devices with red accents, subtle halftone pattern. Futuristic, dynamic, tech-focused. Elements in lower right, open space for text.",
  },
] as const;

export type PromptGuidelineId = (typeof PROMPT_GUIDELINES)[number]["id"];
