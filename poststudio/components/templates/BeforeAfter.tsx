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

export default function BeforeAfter({ headline, cta, primaryColor, colorTheme = "coral" }: Props) {
  const theme  = THEMES[colorTheme]
  const accent = primaryColor || theme.primary

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      width: 1080, height: 1080, overflow: "hidden",
      fontFamily: "Inter, sans-serif",
    }}>
      {/* TOP — Before */}
      <div style={{
        display: "flex", flexDirection: "column",
        width: "100%", height: 537,
        background: "#1a1a1a", padding: "55px 70px",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.25)" }} />
          <span style={{
            fontFamily: "'Space Mono', monospace", fontSize: 16,
            color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.12em",
          }}>Before CodeLess</span>
        </div>
        <div style={{
          fontSize: 48, fontWeight: 700,
          color: "rgba(255,255,255,0.45)", lineHeight: 1.1, maxWidth: 800,
        }}>
          &ldquo;I don&rsquo;t have a tech background. I can&rsquo;t do this.&rdquo;
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: "100%", height: 6, background: accent, flexShrink: 0 }} />

      {/* BOTTOM — After */}
      <div style={{
        display: "flex", flexDirection: "column",
        width: "100%", height: 537,
        background: accent, padding: "50px 70px",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.7)" }} />
          <span style={{
            fontFamily: "'Space Mono', monospace", fontSize: 16,
            color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.12em",
          }}>After CodeLess</span>
        </div>
        <div data-field="headline" style={{ fontSize: 52, fontWeight: 800, color: "white", lineHeight: 1.0, maxWidth: 800 }}>
          {headline}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <span data-field="cta" style={{ fontSize: 20, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{cta}</span>
          <span style={{
            fontFamily: "'Space Mono', monospace", fontSize: 16, color: "rgba(255,255,255,0.5)",
          }}>CodeLess</span>
        </div>
      </div>
    </div>
  )
}
