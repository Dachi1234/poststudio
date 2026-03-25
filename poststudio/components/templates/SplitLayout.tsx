import Image from "next/image"
import { TemplateProps } from "./types"

export default function SplitLayout({
  headline,
  caption,
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
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Main row */}
      <div style={{ display: "flex", flex: 1, position: "relative" }}>
        {/* Left — dark text panel */}
        <div
          style={{
            width: 540,
            backgroundColor: "#2E2E2E",
            padding: 60,
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <p
            style={{
              fontFamily: "Space Mono, monospace",
              fontSize: 14,
              color: primaryColor,
              letterSpacing: 1,
              marginBottom: "auto",
            }}
          >
            CodeLess
          </p>

          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <div>
              <h1
                data-field="headline"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 64,
                  fontWeight: 700,
                  color: "white",
                  lineHeight: 1.1,
                  margin: 0,
                }}
              >
                {headline}
              </h1>
              <p
                data-field="cta"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 20,
                  fontWeight: 600,
                  color: primaryColor,
                  marginTop: 32,
                }}
              >
                {cta}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
            {hashtags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  padding: "6px 14px",
                  borderRadius: 999,
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Center divider */}
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 0,
            bottom: 0,
            width: 3,
            backgroundColor: primaryColor,
            zIndex: 10,
          }}
        />

        {/* Right — image panel */}
        <div
          style={{
            width: 540,
            position: "relative",
            overflow: "hidden",
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
                backgroundColor: `${primaryColor}33`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}
            >
              <div style={{ fontSize: 48, opacity: 0.4 }}>📷</div>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 16,
                  color: "rgba(0,0,0,0.3)",
                }}
              >
                Add photo
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom strip */}
      <div
        style={{
          height: 72,
          backgroundColor: "#5A8DEE",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 60px",
        }}
      >
        <p
          data-field="caption"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 16,
            fontWeight: 400,
            color: "white",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 900,
            textAlign: "center",
          }}
        >
          {caption}
        </p>
      </div>
    </div>
  )
}
