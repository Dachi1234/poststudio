import { TemplateProps } from "./types"

const THEMES = {
  coral:  { primary: "#FD8D6E" },
  blue:   { primary: "#5A8DEE" },
  dark:   { primary: "#2E2E2E" },
  yellow: { primary: "#FFD95A" },
}

interface Props extends TemplateProps {
  primaryColor?: string
  colorTheme?: "coral" | "blue" | "dark" | "yellow"
}

export default function TypographyPoster({ headline, cta, hashtags, primaryColor, colorTheme = "coral" }: Props) {
  const theme  = THEMES[colorTheme]
  const accent = primaryColor || theme.primary
  const words  = headline.split(" ")

  const fontSizeForIndex = (i: number) => i === 0 ? 148 : i === 1 ? 120 : 96

  return (
    <div style={{
      position: "relative", width: 1080, height: 1080,
      background: "#F9F9F9", overflow: "hidden",
      display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "60px 70px", gap: 0,
      fontFamily: "Inter, sans-serif",
    }}>
      {/* Top accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: 12, background: accent,
      }} />

      {/* Wordmark */}
      <span style={{
        position: "absolute", top: 30, right: 65,
        fontFamily: "'Space Mono', monospace", fontSize: 16,
        color: "rgba(46,46,46,0.35)",
      }}>CodeLess</span>

      {/* Words */}
      {words.map((word, i) => (
        <div key={i} style={{
          fontSize: fontSizeForIndex(i),
          fontWeight: 800, lineHeight: 0.92,
          color: i % 2 === 0 ? "#2E2E2E" : accent,
          fontFamily: "Inter, sans-serif",
          wordBreak: "break-all",
        }}>
          {word}
        </div>
      ))}

      {/* Bottom rule + CTA */}
      <div style={{
        position: "absolute", bottom: 60, left: 70, right: 70,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderTop: "2px solid rgba(46,46,46,0.1)", paddingTop: 24,
      }}>
        <span style={{ fontSize: 20, fontWeight: 600, color: "#2E2E2E" }}>{cta}</span>
        <div style={{ display: "flex", gap: 12 }}>
          {hashtags.slice(0, 2).map(tag => (
            <span key={tag} style={{ fontSize: 15, color: "rgba(46,46,46,0.35)" }}>#{tag}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
