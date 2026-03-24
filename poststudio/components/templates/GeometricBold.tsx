import Image from "next/image"
import { TemplateProps } from "./types"

export default function GeometricBold({
  headline,
  caption,
  cta,
  imageUrl,
  primaryColor = "#FD8D6E",
}: TemplateProps) {
  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        backgroundColor: "#5A8DEE",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Decorative rotated coral rectangle */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          backgroundColor: primaryColor,
          top: 0,
          right: 0,
          transform: "translate(20%, -10%) rotate(15deg)",
          opacity: 0.3,
          borderRadius: 24,
        }}
      />

      {/* Decorative small circles */}
      {[
        { size: 20, top: 80, right: 140, opacity: 0.25 },
        { size: 14, top: 115, right: 110, opacity: 0.18 },
        { size: 8,  top: 96,  right: 80,  opacity: 0.2  },
      ].map((circle, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: circle.size,
            height: circle.size,
            borderRadius: "50%",
            backgroundColor: "white",
            top: circle.top,
            right: circle.right,
            opacity: circle.opacity,
          }}
        />
      ))}

      {/* Wordmark */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 60,
          fontFamily: "Space Mono, monospace",
          fontSize: 16,
          fontWeight: 700,
          color: "white",
          letterSpacing: 2,
        }}
      >
        CodeLess
      </div>

      {/* Headline */}
      <h1
        style={{
          position: "absolute",
          left: 60,
          top: "26%",
          fontFamily: "Inter, sans-serif",
          fontSize: 84,
          fontWeight: 800,
          color: "white",
          lineHeight: 1.0,
          margin: 0,
          maxWidth: 620,
        }}
      >
        {headline}
      </h1>

      {/* Circular photo */}
      <div
        style={{
          position: "absolute",
          right: 80,
          top: "50%",
          transform: "translateY(-50%)",
          width: 260,
          height: 260,
          borderRadius: "50%",
          overflow: "hidden",
          border: "4px solid white",
        }}
      >
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
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 48, opacity: 0.5 }}>📷</span>
          </div>
        )}
      </div>

      {/* Bottom section */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 260,
          backgroundColor: "#2E2E2E",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 60px",
          gap: 40,
        }}
      >
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 18,
            fontWeight: 400,
            color: "rgba(255,255,255,0.7)",
            margin: 0,
            flex: 1,
            lineHeight: 1.5,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {caption}
        </p>

        <div
          style={{
            flexShrink: 0,
            backgroundColor: primaryColor,
            color: "#2E2E2E",
            fontFamily: "Inter, sans-serif",
            fontSize: 16,
            fontWeight: 700,
            padding: "16px 32px",
            borderRadius: 999,
            whiteSpace: "nowrap",
          }}
        >
          {cta}
        </div>
      </div>
    </div>
  )
}
