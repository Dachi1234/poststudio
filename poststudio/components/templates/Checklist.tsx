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

export default function Checklist({ headline, cta, hashtags, primaryColor, colorTheme = "coral" }: Props) {
  const theme  = THEMES[colorTheme]
  const accent = primaryColor || theme.primary

  return (
    <div style={{
      position: "relative", width: 1080, height: 1080,
      background: "#F9F9F9", overflow: "hidden",
      display: "flex", flexDirection: "column",
      padding: "80px 90px", justifyContent: "space-between",
      fontFamily: "Inter, sans-serif",
    }}>
      {/* Corner accent */}
      <div style={{
        position: "absolute", bottom: -60, right: -60,
        width: 280, height: 280, borderRadius: "50%",
        background: accent, opacity: 0.12,
      }} />

      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{
          fontFamily: "'Space Mono', monospace", fontSize: 16,
          color: accent, textTransform: "uppercase", letterSpacing: "0.1em",
        }}>CodeLess</span>
        <div style={{ fontSize: 52, fontWeight: 800, color: "#2E2E2E", lineHeight: 1.0, maxWidth: 800 }}>
          {headline}
        </div>
      </div>

      {/* Checklist */}
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {[
          { icon: "✕", text: "A computer science degree", bg: "#2E2E2E", color: "white" },
          { icon: "✕", text: "Any coding knowledge",       bg: "#2E2E2E", color: "white" },
        ].map(({ icon, text, bg, color }) => (
          <div key={text} style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: bg, display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0,
            }}>
              <span style={{ fontSize: 26, color, fontWeight: 700 }}>{icon}</span>
            </div>
            <span style={{ fontSize: 34, fontWeight: 600, color: "#2E2E2E" }}>{text}</span>
          </div>
        ))}

        <div style={{ width: "100%", height: 1, background: "#2E2E2E", opacity: 0.1 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: accent, display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ fontSize: 26, color: "white", fontWeight: 700 }}>✓</span>
          </div>
          <span style={{ fontSize: 34, fontWeight: 700, color: "#2E2E2E" }}>Just this. That&rsquo;s it.</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{
          display: "inline-flex", background: accent,
          borderRadius: 30, padding: "14px 32px",
        }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: "white" }}>{cta}</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {hashtags.slice(0, 2).map(tag => (
            <span key={tag} style={{ fontSize: 15, color: "rgba(46,46,46,0.35)" }}>#{tag}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
