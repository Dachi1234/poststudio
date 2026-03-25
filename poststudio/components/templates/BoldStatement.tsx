import { TemplateProps } from "./types"

export default function BoldStatement({
  headline,
  cta,
  hashtags,
  primaryColor = "#FD8D6E",
}: TemplateProps) {
  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        backgroundColor: primaryColor,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Decorative circle */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.08)",
          top: "50%",
          left: "50%",
          transform: "translate(-10%, -55%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 380,
          height: 380,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.05)",
          top: "50%",
          left: "50%",
          transform: "translate(20%, -30%)",
          pointerEvents: "none",
        }}
      />

      {/* Dot grid bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          right: 80,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          opacity: 0.3,
        }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "white" }}
          />
        ))}
      </div>

      {/* Wordmark */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 60,
          fontFamily: "Space Mono, monospace",
          fontSize: 18,
          fontWeight: 700,
          color: "rgba(255,255,255,0.8)",
          letterSpacing: 2,
        }}
      >
        CodeLess
      </div>

      {/* Center content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 100px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "Space Mono, monospace",
            fontSize: 14,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 32,
          }}
        >
          Learn to lead, not to code.
        </p>

        <h1
          data-field="headline"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 96,
            fontWeight: 800,
            color: "white",
            lineHeight: 1.0,
            margin: 0,
            maxWidth: 860,
          }}
        >
          {headline}
        </h1>

        <div
          style={{
            width: 80,
            height: 2,
            backgroundColor: "rgba(255,255,255,0.2)",
            margin: "48px auto",
          }}
        />

        <p
          data-field="cta"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 24,
            fontWeight: 500,
            color: "rgba(255,255,255,0.8)",
            margin: 0,
          }}
        >
          {cta}
        </p>
      </div>

      {/* Bottom hashtag pills */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 60,
          display: "flex",
          gap: 12,
        }}
      >
        {hashtags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            style={{
              backgroundColor: "#5A8DEE",
              color: "white",
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              fontWeight: 500,
              padding: "6px 16px",
              borderRadius: 999,
            }}
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  )
}
