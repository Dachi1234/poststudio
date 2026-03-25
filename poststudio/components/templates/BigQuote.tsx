import { TemplateProps } from "./types"

const THEMES = {
  coral:  { primary: "#FD8D6E", text: "#FFFFFF", textDark: "#2E2E2E" },
  blue:   { primary: "#5A8DEE", text: "#FFFFFF", textDark: "#2E2E2E" },
  dark:   { primary: "#2E2E2E", text: "#FFFFFF", textDark: "#FFFFFF" },
  yellow: { primary: "#FFD95A", text: "#2E2E2E", textDark: "#2E2E2E" },
}

interface Props extends TemplateProps {
  primaryColor?: string
  colorTheme?: "coral" | "blue" | "dark" | "yellow"
}

export default function BigQuote({ headline, cta, hashtags, primaryColor, colorTheme = "coral" }: Props) {
  const theme = THEMES[colorTheme]
  const bg    = primaryColor || theme.primary

  return (
    <div style={{
      position: "relative", width: 1080, height: 1080,
      background: bg, overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Inter, sans-serif",
    }}>
      {/* Giant decorative quote */}
      <div style={{
        position: "absolute", fontSize: 520, fontWeight: 800,
        color: "rgba(255,255,255,0.08)", fontFamily: "Inter, sans-serif",
        top: -80, left: -20, lineHeight: 1, userSelect: "none",
      }}>&ldquo;</div>

      {/* Wordmark */}
      <span style={{
        position: "absolute", top: 55, left: 60,
        fontFamily: "'Space Mono', monospace", fontSize: 20,
        color: "rgba(255,255,255,0.55)",
      }}>CodeLess</span>

      {/* Main content */}
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "flex-start", gap: 36,
        padding: "0 80px", maxWidth: 960, position: "relative",
      }}>
        <div data-field="headline" style={{
          fontSize: 62, fontWeight: 700, color: theme.text, lineHeight: 1.1,
        }}>
          {headline}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 40, height: 3, background: "rgba(255,255,255,0.4)" }} />
          <span style={{
            fontFamily: "'Space Mono', monospace", fontSize: 18,
            color: "rgba(255,255,255,0.6)",
          }}>CodeLess Student</span>
        </div>
        <div data-field="cta" style={{
          display: "inline-flex", background: "rgba(255,255,255,0.15)",
          borderRadius: 30, padding: "12px 30px",
          fontSize: 18, fontWeight: 600, color: theme.text,
        }}>
          {cta}
        </div>
      </div>

      {/* Hashtags */}
      <div style={{
        position: "absolute", bottom: 55, left: 80,
        display: "flex", gap: 16,
      }}>
        {hashtags.slice(0, 3).map(tag => (
          <span key={tag} style={{ fontSize: 17, color: "rgba(255,255,255,0.35)" }}>
            #{tag}
          </span>
        ))}
      </div>
    </div>
  )
}
