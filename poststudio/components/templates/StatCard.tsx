import { TemplateProps } from "./types"

const THEMES = {
  coral:  { primary: "#FD8D6E", textDark: "#2E2E2E" },
  blue:   { primary: "#5A8DEE", textDark: "#2E2E2E" },
  dark:   { primary: "#FD8D6E", textDark: "#2E2E2E" },
  yellow: { primary: "#FFD95A", textDark: "#2E2E2E" },
}

interface Props extends TemplateProps {
  primaryColor?: string
  colorTheme?: "coral" | "blue" | "dark" | "yellow"
}

export default function StatCard({ headline, caption, cta, primaryColor, colorTheme = "coral" }: Props) {
  const theme   = THEMES[colorTheme]
  const accent  = primaryColor || theme.primary
  const statNum = headline.split(" ")[0]

  return (
    <div style={{
      position: "relative", width: 1080, height: 1080,
      background: "#2E2E2E", overflow: "hidden",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "Inter, sans-serif",
    }}>
      {/* Concentric circle decorations */}
      {[800, 600].map((size) => (
        <div key={size} style={{
          position: "absolute", width: size, height: size,
          borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
        }} />
      ))}

      {/* Wordmark */}
      <span style={{
        position: "absolute", top: 55,
        fontFamily: "'Space Mono', monospace", fontSize: 20,
        color: "rgba(255,255,255,0.4)", left: "50%",
        transform: "translateX(-50%)", whiteSpace: "nowrap",
      }}>CodeLess</span>

      {/* Big stat number */}
      <div data-field="headline" style={{
        fontSize: 220, fontWeight: 800, color: accent,
        lineHeight: 0.9, fontFamily: "Inter, sans-serif",
        textAlign: "center", wordBreak: "break-all", maxWidth: 960,
      }}>
        {statNum}
      </div>

      {/* Supporting text */}
      <div data-field="caption" style={{
        fontSize: 36, fontWeight: 500,
        color: "rgba(255,255,255,0.7)", textAlign: "center",
        marginTop: 30, maxWidth: 700, lineHeight: 1.3,
      }}>
        {caption.substring(0, 60)}
      </div>

      {/* CTA pill */}
      <div data-field="cta" style={{
        position: "absolute", bottom: 70,
        display: "inline-flex", background: accent,
        borderRadius: 30, padding: "14px 36px",
        fontSize: 20, fontWeight: 700, color: theme.textDark,
      }}>
        {cta}
      </div>
    </div>
  )
}
