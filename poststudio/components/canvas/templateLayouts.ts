/**
 * Template layout definitions for the Canvas Editor.
 *
 * Each layout mirrors the corresponding React HTML template
 * (in components/templates/) so that the Fabric.js canvas
 * reproduces the same visual structure.
 */

const CS = 1080

/* ── Theme palette ──────────────────────────────────────────────── */

export type ThemeEntry = { bg: string; text: string; accent: string }

export const THEMES: Record<string, ThemeEntry> = {
  coral:  { bg: "#FD8D6E", text: "#FFFFFF", accent: "#2E2E2E" },
  blue:   { bg: "#5A8DEE", text: "#FFFFFF", accent: "#FFFFFF" },
  dark:   { bg: "#2E2E2E", text: "#FFFFFF", accent: "#FD8D6E" },
  yellow: { bg: "#FFD95A", text: "#2E2E2E", accent: "#2E2E2E" },
}

/* ── Spec types ─────────────────────────────────────────────────── */

export interface TxtSpec {
  /** Which post field to pull text from, or "static" for fixed labels */
  field: "headline" | "caption" | "cta" | "hashtags" | "static"
  /** Override text (for static labels or split words) */
  text?: string
  top: number
  left: number
  width: number
  fontSize: number
  weight?: string
  fontFamily?: string
  align?: "left" | "center" | "right"
  fill: string
  opacity?: number
  lineHeight?: number
  charSpacing?: number
}

export type ShapeSpec =
  | {
      type: "rect"
      left: number; top: number; width: number; height: number
      fill: string; rx?: number; ry?: number
      opacity?: number; angle?: number
      originX?: string; originY?: string
    }
  | {
      type: "circle"
      left: number; top: number; radius: number
      fill: string; opacity?: number
      stroke?: string; strokeWidth?: number
    }
  | {
      type: "line"
      points: [number, number, number, number]
      stroke: string; strokeWidth: number
      opacity?: number
    }

export interface TemplateLayout {
  bg: string
  shapes: ShapeSpec[]
  elements: TxtSpec[]
}

/* ── Layout builder ─────────────────────────────────────────────── */

export function getTemplateLayout(
  templateId: string | undefined,
  colorTheme: string | undefined,
  headline: string,
  caption: string,
  hasImage: boolean,
): TemplateLayout {
  const theme: ThemeEntry = colorTheme
    ? (THEMES[colorTheme] ?? THEMES.coral)
    : THEMES.coral
  const WHITE = "#FFFFFF"
  const DARK  = "#2E2E2E"
  const hl    = headline.length
  const capFull = caption.slice(0, 180)

  switch (templateId) {

    /* ────────────────────────────────────────────────────────────────
       BOLD STATEMENT
       Full-color bg, decorative circles, centered headline + CTA
    ──────────────────────────────────────────────────────────────── */
    case "bold-statement": {
      const fs = hl > 80 ? 72 : hl > 50 ? 86 : 96
      return {
        bg: theme.bg,
        shapes: [
          // Large decorative circle (faint)
          { type: "circle", left: CS / 2, top: CS / 2, radius: 300, fill: "transparent", stroke: WHITE, strokeWidth: 1, opacity: 0.08 },
          // Smaller decorative circle
          { type: "circle", left: CS / 2, top: CS / 2, radius: 190, fill: "transparent", stroke: WHITE, strokeWidth: 1, opacity: 0.08 },
          // Separator line below headline
          { type: "rect", left: (CS - 80) / 2, top: 600, width: 80, height: 2, fill: WHITE, opacity: 0.5 },
        ],
        elements: [
          { field: "static", text: "PostStudio", top: 55, left: 60, width: 200, fontSize: 18, weight: "700", fontFamily: "Space Mono", fill: WHITE, opacity: 0.85 },
          { field: "headline", top: 340, left: 100, width: 880, fontSize: fs, weight: "800", align: "center", fill: WHITE, lineHeight: 1.0, charSpacing: -10 },
          { field: "cta", top: 650, left: 100, width: 880, fontSize: 24, weight: "500", align: "center", fill: WHITE, opacity: 0.85 },
          { field: "hashtags", top: 960, left: 60, width: 920, fontSize: 18, align: "left", fill: "#5A8DEE", opacity: 0.9 },
        ],
      }
    }

    /* ────────────────────────────────────────────────────────────────
       BIG QUOTE
       Full-color bg, giant comma mark, centered headline
    ──────────────────────────────────────────────────────────────── */
    case "big-quote": {
      const fs = hl > 80 ? 48 : hl > 50 ? 56 : 62
      const isDark  = colorTheme === "dark"
      const isYellow = colorTheme === "yellow"
      const textFill = isDark ? WHITE : isYellow ? DARK : WHITE
      return {
        bg: theme.bg,
        shapes: [
          // Accent underline below headline
          { type: "rect", left: (CS - 40) / 2, top: 580, width: 40, height: 3, fill: textFill, opacity: 0.4 },
        ],
        elements: [
          // Giant decorative comma (acts as a huge quote mark)
          { field: "static", text: "\u201C", top: -80, left: 40, width: 400, fontSize: 520, weight: "700", fill: textFill, opacity: 0.06 },
          // Wordmark
          { field: "static", text: "PostStudio", top: 55, left: 60, width: 200, fontSize: 20, fontFamily: "Space Mono", fill: textFill, opacity: 0.7 },
          // Main quote / headline — centered
          { field: "headline", top: 340, left: 80, width: 920, fontSize: fs, weight: "700", align: "center", fill: textFill, lineHeight: 1.15 },
          // Attribution line
          { field: "static", text: "— PostStudio", top: 610, left: 80, width: 920, fontSize: 16, fontFamily: "Space Mono", align: "center", fill: textFill, opacity: 0.45 },
          // CTA in pill area
          { field: "cta", top: 730, left: CS / 2 - 200, width: 400, fontSize: 18, weight: "600", align: "center", fill: textFill, opacity: 0.8 },
          // Hashtags bottom-left
          { field: "hashtags", top: 970, left: 80, width: 920, fontSize: 17, align: "left", fill: textFill, opacity: 0.35 },
        ],
      }
    }

    /* ────────────────────────────────────────────────────────────────
       STAT CARD
       Dark bg, concentric circles, huge accent-colored stat number
    ──────────────────────────────────────────────────────────────── */
    case "stat-card": {
      const firstWord = headline.split(/\s+/)[0] ?? headline
      const rest = headline.slice(firstWord.length).trim()
      const numFs = firstWord.length > 6 ? 140 : firstWord.length > 3 ? 180 : 220
      return {
        bg: DARK,
        shapes: [
          // Outer concentric circle
          { type: "circle", left: CS / 2, top: CS / 2, radius: 400, fill: "transparent", stroke: WHITE, strokeWidth: 1, opacity: 0.04 },
          // Inner concentric circle
          { type: "circle", left: CS / 2, top: CS / 2, radius: 300, fill: "transparent", stroke: WHITE, strokeWidth: 1, opacity: 0.04 },
        ],
        elements: [
          // Wordmark top center
          { field: "static", text: "PostStudio", top: 55, left: 0, width: CS, fontSize: 20, fontFamily: "Space Mono", align: "center", fill: WHITE, opacity: 0.3 },
          // Big stat number
          { field: "static", text: firstWord, top: 300, left: 80, width: 920, fontSize: numFs, weight: "800", align: "center", fill: theme.bg, lineHeight: 0.9 },
          // Supporting text (rest of headline)
          ...(rest ? [{ field: "static" as const, text: rest, top: 300 + numFs * 0.85, left: 80, width: 920, fontSize: 36, weight: "500", align: "center" as const, fill: WHITE, opacity: 0.55 }] : []),
          // Caption
          { field: "caption", top: 650, left: 80, width: 920, fontSize: 28, align: "center", fill: WHITE, opacity: 0.5, lineHeight: 1.5 },
          // CTA pill at bottom
          { field: "cta", top: 910, left: CS / 2 - 200, width: 400, fontSize: 20, weight: "700", align: "center", fill: theme.bg },
        ],
      }
    }

    /* ────────────────────────────────────────────────────────────────
       MINIMAL CARD
       White bg, centered, accent divider bar, clean typography
    ──────────────────────────────────────────────────────────────── */
    case "minimal-card": {
      const fs = hl > 60 ? 56 : 72
      return {
        bg: WHITE,
        shapes: [
          // Wordmark underline
          { type: "rect", left: (CS - 30) / 2, top: 90, width: 30, height: 2, fill: theme.bg },
          // Accent divider bar below headline
          { type: "rect", left: (CS - 100) / 2, top: 530, width: 100, height: 5, fill: theme.bg, rx: 3 },
        ],
        elements: [
          // Wordmark centered top
          { field: "static", text: "PostStudio", top: 60, left: 0, width: CS, fontSize: 18, fontFamily: "Space Mono", align: "center", fill: DARK, opacity: 0.6 },
          // Headline
          { field: "headline", top: 280, left: 120, width: 840, fontSize: fs, weight: "800", align: "center", fill: DARK, lineHeight: 1.05 },
          // Caption
          { field: "caption", top: 560, left: 140, width: 800, fontSize: 28, align: "center", fill: DARK, opacity: 0.45, lineHeight: 1.5 },
          // CTA
          { field: "cta", top: 840, left: 100, width: 880, fontSize: 20, weight: "700", align: "center", fill: theme.bg },
          // Hashtags
          { field: "hashtags", top: 930, left: 100, width: 880, fontSize: 15, align: "center", fill: DARK, opacity: 0.3 },
        ],
      }
    }

    /* ────────────────────────────────────────────────────────────────
       GRADIENT OVERLAY
       Image bg + gradient overlay, text at bottom, circle top-right
    ──────────────────────────────────────────────────────────────── */
    case "gradient-overlay": {
      const fs = hl > 60 ? 62 : 80
      return {
        bg: DARK,
        shapes: [
          // Dark gradient overlay (simulated as semi-transparent rect at bottom)
          { type: "rect", left: 0, top: 0, width: CS, height: CS, fill: "rgba(0,0,0,0.15)" },
          { type: "rect", left: 0, top: 540, width: CS, height: 540, fill: "rgba(0,0,0,0.55)" },
          // Circle indicator top-right
          { type: "circle", left: CS - 80 - 22, top: 48 + 22, radius: 22, fill: theme.bg },
        ],
        elements: [
          // Wordmark top-left
          { field: "static", text: "PostStudio", top: 48, left: 80, width: 200, fontSize: 16, fontFamily: "Space Mono", fill: WHITE, opacity: 0.8 },
          // Hashtags (above headline)
          { field: "hashtags", top: 780, left: 80, width: 920, fontSize: 14, align: "left", fill: WHITE, opacity: 0.65 },
          // Headline at bottom
          { field: "headline", top: 830, left: 80, width: 920, fontSize: fs, weight: "800", align: "left", fill: WHITE, lineHeight: 1.0 },
          // CTA
          { field: "cta", top: 1010, left: 80, width: 500, fontSize: 18, weight: "700", align: "left", fill: theme.bg },
        ],
      }
    }

    /* ────────────────────────────────────────────────────────────────
       GEOMETRIC BOLD
       Blue bg, rotated coral rectangle, headline left, dark bottom strip
    ──────────────────────────────────────────────────────────────── */
    case "geometric-bold": {
      const fs = hl > 60 ? 64 : 84
      return {
        bg: "#5A8DEE",
        shapes: [
          // Rotated coral rectangle (decorative)
          { type: "rect", left: 700, top: -50, width: 500, height: 500, fill: theme.bg, opacity: 0.35, angle: 15 },
          // Decorative small circles
          { type: "circle", left: 900, top: 350, radius: 10, fill: WHITE, opacity: 0.15 },
          { type: "circle", left: 940, top: 400, radius: 7, fill: WHITE, opacity: 0.1 },
          { type: "circle", left: 880, top: 430, radius: 4, fill: WHITE, opacity: 0.08 },
          // Dark bottom strip (260px)
          { type: "rect", left: 0, top: 820, width: CS, height: 260, fill: DARK },
        ],
        elements: [
          // Wordmark top-left
          { field: "static", text: "PostStudio", top: 55, left: 60, width: 200, fontSize: 16, fontFamily: "Space Mono", fill: WHITE, opacity: 0.85 },
          // Headline — left side, upper area
          { field: "headline", top: 280, left: 60, width: 620, fontSize: fs, weight: "800", align: "left", fill: WHITE, lineHeight: 1.0 },
          // Caption — in dark bottom strip, left side
          { field: "caption", top: 850, left: 60, width: 600, fontSize: 18, align: "left", fill: WHITE, opacity: 0.65, lineHeight: 1.5 },
          // CTA — in dark bottom strip, right side (pill style)
          { field: "cta", top: 870, left: 720, width: 300, fontSize: 16, weight: "700", align: "center", fill: theme.bg },
        ],
      }
    }

    /* ────────────────────────────────────────────────────────────────
       SPLIT LAYOUT
       Dark left (540px), image right, vertical divider, blue bottom strip
    ──────────────────────────────────────────────────────────────── */
    case "split-layout": {
      const fs = hl > 60 ? 48 : 64
      return {
        bg: DARK,
        shapes: [
          // Right panel placeholder (lighter shade to suggest image area)
          { type: "rect", left: 543, top: 0, width: 537, height: 1008, fill: "#3a3a3a" },
          // Vertical center divider
          { type: "line", points: [540, 0, 540, 1008], stroke: theme.bg, strokeWidth: 3 },
          // Blue bottom strip (72px)
          { type: "rect", left: 0, top: 1008, width: CS, height: 72, fill: "#5A8DEE" },
        ],
        elements: [
          // Wordmark on left panel
          { field: "static", text: "PostStudio", top: 50, left: 60, width: 200, fontSize: 14, fontFamily: "Space Mono", fill: theme.bg, opacity: 0.9 },
          // Headline — left panel, vertically centered
          { field: "headline", top: 320, left: 60, width: 420, fontSize: fs, weight: "700", align: "left", fill: WHITE, lineHeight: 1.1 },
          // CTA — left panel, below headline
          { field: "cta", top: 620, left: 60, width: 420, fontSize: 20, weight: "600", align: "left", fill: theme.bg },
          // Hashtags — left panel, near bottom
          { field: "hashtags", top: 900, left: 60, width: 420, fontSize: 14, align: "left", fill: WHITE, opacity: 0.45 },
          // Caption — in blue bottom strip
          { field: "caption", top: 1022, left: 60, width: 960, fontSize: 16, align: "center", fill: WHITE },
        ],
      }
    }

    /* ────────────────────────────────────────────────────────────────
       BEFORE / AFTER
       Dark top half, accent divider, accent bottom half, labels
    ──────────────────────────────────────────────────────────────── */
    case "before-after": {
      const fs = hl > 60 ? 42 : 52
      return {
        bg: "#1a1a1a",
        shapes: [
          // Accent divider bar
          { type: "rect", left: 0, top: 537, width: CS, height: 6, fill: theme.bg },
          // Accent bottom half
          { type: "rect", left: 0, top: 543, width: CS, height: 537, fill: theme.bg },
        ],
        elements: [
          // "Before" label — top half
          { field: "static", text: "Before", top: 55, left: 70, width: 300, fontSize: 16, fontFamily: "Space Mono", fill: WHITE, opacity: 0.5 },
          // Dummy "before" quote (faded text in top half)
          { field: "static", text: "Same old approach.\nSame old results.", top: 200, left: 70, width: 500, fontSize: 28, fill: WHITE, opacity: 0.25, lineHeight: 1.4 },
          // "After" label — bottom half
          { field: "static", text: "After", top: 570, left: 70, width: 300, fontSize: 16, fontFamily: "Space Mono", fill: WHITE, opacity: 0.7 },
          // Headline — bottom half
          { field: "headline", top: 640, left: 70, width: 940, fontSize: fs, weight: "800", align: "left", fill: WHITE, lineHeight: 1.05 },
          // CTA — bottom-left
          { field: "cta", top: 985, left: 70, width: 500, fontSize: 20, weight: "600", align: "left", fill: WHITE, opacity: 0.85 },
          // Brand label bottom-right
          { field: "static", text: "PostStudio", top: 990, left: 700, width: 310, fontSize: 14, fontFamily: "Space Mono", align: "right", fill: WHITE, opacity: 0.5 },
        ],
      }
    }

    /* ────────────────────────────────────────────────────────────────
       CHECKLIST
       Light bg, top accent bar, checklist items, corner circle
    ──────────────────────────────────────────────────────────────── */
    case "checklist": {
      const fs = hl > 60 ? 42 : 52
      return {
        bg: "#F9F9F9",
        shapes: [
          // Top accent bar
          { type: "rect", left: 0, top: 0, width: CS, height: 12, fill: theme.bg },
          // Corner accent circle (bottom-right)
          { type: "circle", left: CS - 40, top: CS - 40, radius: 140, fill: theme.bg, opacity: 0.12 },
        ],
        elements: [
          // Section label
          { field: "static", text: "CHECKLIST", top: 80, left: 90, width: 300, fontSize: 16, fontFamily: "Space Mono", fill: theme.bg, charSpacing: 200 },
          // Headline
          { field: "headline", top: 120, left: 90, width: 900, fontSize: fs, weight: "800", align: "left", fill: DARK, lineHeight: 1.1 },
          // Checklist items (static text with X / check marks)
          { field: "static", text: "\u2717  Old way of doing things", top: 380, left: 90, width: 800, fontSize: 24, fill: DARK, opacity: 0.45 },
          { field: "static", text: "\u2717  Guesswork and confusion", top: 440, left: 90, width: 800, fontSize: 24, fill: DARK, opacity: 0.45 },
          { field: "static", text: "\u2713  A better path forward", top: 530, left: 90, width: 800, fontSize: 24, weight: "600", fill: theme.bg },
          // Separator
          // CTA pill area
          { field: "cta", top: 930, left: 90, width: 400, fontSize: 20, weight: "700", align: "left", fill: WHITE },
          // Hashtags right
          { field: "hashtags", top: 935, left: 500, width: 490, fontSize: 15, align: "right", fill: DARK, opacity: 0.35 },
        ],
      }
    }

    /* ────────────────────────────────────────────────────────────────
       TYPOGRAPHY POSTER
       Light bg, top accent bar, headline words split into lines
       with varying sizes and alternating colors
    ──────────────────────────────────────────────────────────────── */
    case "typography-poster": {
      const words = headline.split(/\s+/).slice(0, 5)
      const wordSizes = [148, 120, 96, 96, 96]
      let y = 120
      const wordElements: TxtSpec[] = words.map((word, i) => {
        const fSize = wordSizes[i] ?? 96
        const el: TxtSpec = {
          field: "static",
          text: word,
          top: y,
          left: 70,
          width: 940,
          fontSize: fSize,
          weight: "800",
          align: "left",
          fill: i % 2 === 0 ? DARK : theme.bg,
          lineHeight: 0.92,
          charSpacing: -20,
        }
        y += fSize * 0.92 + 8
        return el
      })

      return {
        bg: "#F9F9F9",
        shapes: [
          // Top accent bar
          { type: "rect", left: 0, top: 0, width: CS, height: 12, fill: theme.bg },
          // Bottom separator line
          { type: "rect", left: 70, top: 936, width: CS - 140, height: 2, fill: "rgba(46,46,46,0.1)" },
        ],
        elements: [
          // Wordmark top-right
          { field: "static", text: "PostStudio", top: 30, left: 700, width: 310, fontSize: 16, fontFamily: "Space Mono", align: "right", fill: DARK, opacity: 0.4 },
          // Individual headline words
          ...wordElements,
          // CTA bottom-left
          { field: "cta", top: 958, left: 70, width: 500, fontSize: 20, weight: "600", align: "left", fill: DARK },
          // Hashtags bottom-right
          { field: "hashtags", top: 960, left: 580, width: 430, fontSize: 15, align: "right", fill: DARK, opacity: 0.35 },
        ],
      }
    }

    /* ────────────────────────────────────────────────────────────────
       DEFAULT — no template: neutral canvas
    ──────────────────────────────────────────────────────────────── */
    default: {
      const fs = hl > 80 ? 52 : hl > 50 ? 64 : 80
      return {
        bg: hasImage ? DARK : "#FFFFFF",
        shapes: [],
        elements: [
          { field: "headline", top: 120, left: 80, width: 920, fontSize: fs, weight: "700", align: "center", fill: hasImage ? WHITE : DARK, lineHeight: 1.1, charSpacing: -15 },
          { field: "caption", top: 460, left: 80, width: 920, fontSize: capFull.length > 160 ? 26 : 30, align: "center", fill: hasImage ? WHITE : DARK, opacity: 0.88, lineHeight: 1.55 },
          { field: "cta", top: 800, left: 80, width: 920, fontSize: 38, weight: "600", align: "center", fill: "#FD8D6E" },
          { field: "hashtags", top: 930, left: 80, width: 920, fontSize: 20, align: "center", fill: hasImage ? WHITE : DARK, opacity: 0.5 },
        ],
      }
    }
  }
}
