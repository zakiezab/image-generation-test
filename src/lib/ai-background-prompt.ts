/**
 * Hidden system prompt for AI background generation.
 * Prepended to user input server-side only — never shown in the UI.
 */
export const AI_BACKGROUND_SYSTEM_PROMPT = `STYLE & PERSPECTIVE:
Isometric 3D illustration, classic isometric projection at 30° elevation and 45° azimuth rotation. Objects anchored to the bottom-right corner of a square canvas, slightly cropped at the edges, leaving the upper-left two-thirds as open negative space. Corporate tech editorial style — similar to Notion, AWS, or ServiceNow marketing illustration style.
BACKGROUND:
Deep space gradient full screen background — not white or transparent. Dark navy blue (#0D0B2B) in the top-left fading into rich violet-purple (#3B2A8C) toward the center and bottom-right. Two subtle circular light bloom shapes in the top-right corner area, slightly lighter than the background, suggesting ambient light sources. No hard edges on background. No glow or starry objects on background.
OBJECT STYLE:
Flat-face isometric volumes with smooth color fills — no photorealistic textures or gradients. Edges defined by color value contrast between faces (top face lightest, left face mid-tone, right face darkest), not by black outlines. Very thin, subtle inner edge highlight (1px off-white) on top edges of objects to suggest sharpness. Clean geometric primitives: boxes, cylinders, rounded rectangles in isometric space. Rounded corners on all major volumes (corner radius proportional to object size).
COLOR PALETTE:
Purple tones (use for secondary surfaces, platforms, base layers): Deep: #897DFF, Mid: #B8A8FF, Light: #E8E3FF. Red/Coral/Salmon tones (use for focal elements, accent pieces, key interactive components): Deep: #D8242A, Mid/Salmon: #FFBDBD, Light blush: #FFEBEB. Neutral/Grey tones (use for primary object bodies, screens, hardware casings): Dark: #242C36, Mid: #C1C4CA, Light: #F4F6F7. Surface tones following isometric face logic: Top face: lightest value of the object's assigned color; Left face: mid value; Right face: darkest value (approximately 30% darker than mid).
ACCENT & ATMOSPHERE DETAILS:
Small scattered decorative elements floating near the main object: isometric mini-cubes, network node dots connected by thin lines, or geometric polygon outlines — in muted red or purple tones, small scale, not distracting. Subtle dotted grid or halftone texture on one surface of the main object (dark charcoal dots on a slightly lighter surface, very low opacity). If relevant to subject: thin glowing connector lines or cable-like shapes in salmon/blush pink connecting components. Drop shadow beneath the entire object cluster: very soft, dark violet, low opacity elliptical shadow on the ground plane.
COMPOSITION:
Main object cluster occupies roughly the bottom 50% and right 50% of the canvas. Objects may bleed slightly off the right and bottom edges. Top-left area intentionally empty — reserved for text overlay in final use. One primary focal object, supported by 1–2 smaller secondary objects at different elevations (stacked or adjacent).
LIGHTING:
Primary light source: top-center, slightly left. Top faces receive the most light (near-white or light tint of object color). Side faces in shadow — use darker shades from the same color family, not black. No cast shadows from objects onto background — only a faint elliptical drop shadow directly beneath.
WHAT TO AVOID:
No photorealistic materials, lens flares, or 3D render noise. No glow or starry objects. No heavy black outlines or cartoon-style stroke borders. No centered composition — keep objects to one corner. No white or transparent backgrounds. No text or labels within the illustration.

Subject and content to depict: `;
