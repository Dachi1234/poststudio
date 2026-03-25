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

export default function MinimalCard({ headline, caption, cta, hashtags, primaryColor, colorTheme = "coral" }: Props) {
  const theme  = THEMES[colorTheme]
  const accent = primaryColor || theme.primary

  return (
    <div style={{
      position: "relative", width: 1080, height: 1080,
      background: "white", overflow: "hidden",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "100px 120px",
      fontFamily: "Inter, sans-serif",
    }}>
      {/* Wordmark top center */}
      <div style={{
        position: "absolute", top: 60,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
      }}>
        <span style={{
          fontFamily: "'Space Mono', monospace", fontSize: 18,
          color: "#2E2E2E", letterSpacing: "0.05em",
        }}>CodeLess</span>
        <div style={{ width: 30, height: 2, background: accent }} />
      </div>

      {/* Main content */}
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 40, textAlign: "center",
      }}>
        <div data-field="headline" style={{
          fontSize: 72, fontWeight: 800, color: "#2E2E2E",
          lineHeight: 1.05, maxWidth: 840,
        }}>
          {headline}
        </div>
        <div style={{ width: 100, height: 5, borderRadius: 3, background: accent }} />
        <div data-field="caption" style={{
          fontSize: 28, fontWeight: 400,
          color: "rgba(46,46,46,0.55)", lineHeight: 1.5, maxWidth: 700,
        }}>
          {caption.substring(0, 100)}
        </div>
      </div>

      {/* Bottom CTA + hashtags */}
      <div style={{
        position: "absolute", bottom: 65,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 18,
      }}>
        <div data-field="cta" style={{
          display: "inline-flex", background: accent,
          borderRadius: 30, padding: "14px 40px",
          fontSize: 20, fontWeight: 700, color: "white",
        }}>
          {cta}
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {hashtags.slice(0, 3).map(tag => (
            <span key={tag} style={{ fontSize: 15, color: "rgba(46,46,46,0.3)" }}>#{tag}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
