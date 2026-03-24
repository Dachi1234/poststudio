import Image from "next/image"
import { TemplateProps } from "./types"

export default function GradientOverlay({
  headline,
  cta,
  hashtags,
  imageUrl,
  primaryColor = "#FD8D6E",
}: TemplateProps) {
  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Layer 1: Background image or fallback gradient */}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={headline}
          fill
          style={{ objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, #2E2E2E 0%, #5A8DEE 100%)",
          }}
        />
      )}

      {/* Layer 2: Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(46,46,46,0.94) 0%, rgba(46,46,46,0.52) 50%, transparent 100%)",
        }}
      />

      {/* Layer 3: Bottom content */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "0 80px 80px",
        }}
      >
        {/* Hashtag pills */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
          {hashtags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "white",
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                fontWeight: 500,
                padding: "6px 14px",
                borderRadius: 999,
                backdropFilter: "blur(8px)",
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 80,
            fontWeight: 800,
            color: "white",
            lineHeight: 1.0,
            margin: "0 0 36px 0",
          }}
        >
          {headline}
        </h1>

        {/* CTA pill */}
        <div
          style={{
            display: "inline-block",
            backgroundColor: primaryColor,
            color: "#2E2E2E",
            fontFamily: "Inter, sans-serif",
            fontSize: 18,
            fontWeight: 700,
            padding: "16px 40px",
            borderRadius: 999,
          }}
        >
          {cta}
        </div>
      </div>

      {/* Layer 4: Top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "48px 80px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p
          style={{
            fontFamily: "Space Mono, monospace",
            fontSize: 16,
            color: "white",
            letterSpacing: 1,
            margin: 0,
          }}
        >
          CodeLess
        </p>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            backgroundColor: primaryColor,
          }}
        />
      </div>
    </div>
  )
}
