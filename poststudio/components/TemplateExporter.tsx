"use client"

import { useState } from "react"
import { X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { GeneratedPost } from "@/types"
import { CODELESS_BRAND } from "@/lib/brand"
import { exportTemplate } from "@/lib/api"
import BoldStatement    from "./templates/BoldStatement"
import SplitLayout      from "./templates/SplitLayout"
import GradientOverlay  from "./templates/GradientOverlay"
import GeometricBold    from "./templates/GeometricBold"
import BigQuote         from "./templates/BigQuote"
import StatCard         from "./templates/StatCard"
import BeforeAfter      from "./templates/BeforeAfter"
import Checklist        from "./templates/Checklist"
import TypographyPoster from "./templates/TypographyPoster"
import MinimalCard      from "./templates/MinimalCard"

interface TemplateExporterProps {
  post: GeneratedPost
  platform: "instagram" | "linkedin" | "facebook"
  templateId: string
  onExported: (dataUrl: string) => void
  onEditInCanvas: () => void
  onClose: () => void
}

type AnyTemplateProps = {
  headline: string; caption: string; cta: string; hashtags: string[]
  imageUrl?: string; platform: "instagram" | "linkedin" | "facebook"; primaryColor?: string
}

const PREVIEW_COMPONENTS: Record<string, React.ComponentType<AnyTemplateProps>> = {
  "bold-statement":    BoldStatement,
  "split-layout":      SplitLayout,
  "gradient-overlay":  GradientOverlay,
  "geometric-bold":    GeometricBold,
  "big-quote":         BigQuote,
  "stat-card":         StatCard,
  "before-after":      BeforeAfter,
  "checklist":         Checklist,
  "typography-poster": TypographyPoster,
  "minimal-card":      MinimalCard,
}

const TEMPLATE_NAMES: Record<string, string> = {
  "bold-statement":    "Bold Statement",
  "split-layout":      "Split Layout",
  "gradient-overlay":  "Gradient Overlay",
  "geometric-bold":    "Geometric Bold",
  "big-quote":         "Big Quote",
  "stat-card":         "Stat Card",
  "before-after":      "Before / After",
  "checklist":         "Checklist",
  "typography-poster": "Type Poster",
  "minimal-card":      "Minimal Card",
}

const COLOR_THEMES: Array<{ label: string; color: string; themeKey: string }> = [
  { label: "Coral",  color: CODELESS_BRAND.colors.coral,      themeKey: "coral"  },
  { label: "Blue",   color: CODELESS_BRAND.colors.blue,       themeKey: "blue"   },
  { label: "Dark",   color: CODELESS_BRAND.colors.darkGray,   themeKey: "dark"   },
  { label: "Yellow", color: CODELESS_BRAND.colors.softYellow, themeKey: "yellow" },
]

const PREVIEW_SCALE = 500 / 1080

export default function TemplateExporter({
  post, platform, templateId, onExported, onEditInCanvas, onClose,
}: TemplateExporterProps) {
  const [selectedTheme, setSelectedTheme] = useState(COLOR_THEMES[0])
  const [exporting, setExporting]         = useState(false)

  const TemplateComponent = PREVIEW_COMPONENTS[templateId]
  const templateName      = TEMPLATE_NAMES[templateId] ?? templateId

  const templateProps = {
    headline:     post.headline,
    caption:      post.caption,
    cta:          post.cta,
    hashtags:     post.hashtags,
    imageUrl:     post.imageUrl,
    platform,
    primaryColor: selectedTheme.color,
  }

  async function handleExport(format: "png" | "jpeg") {
    setExporting(true)
    try {
      const blob = await exportTemplate({
        templateId,
        post: {
          headline:   post.headline,
          caption:    post.caption,
          cta:        post.cta,
          hashtags:   post.hashtags,
          imageUrl:   post.imageUrl,
        },
        platform,
        colorTheme: selectedTheme.themeKey,
        format,
      })

      const url  = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.download = `codeless-post.${format === "jpeg" ? "jpg" : "png"}`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)

      toast.success("Downloaded!")
      onExported(url)
    } catch (err) {
      console.error("Export error:", err)
      toast.error("Export failed — make sure the backend is running")
    } finally {
      setExporting(false)
    }
  }

  if (!TemplateComponent) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="h-12 border-b border-gray-100 flex items-center justify-between px-5 flex-shrink-0">
          <span className="font-[family-name:var(--font-inter)] font-semibold text-sm text-[#2E2E2E]">
            {templateName}
          </span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* LEFT — post info + theme */}
          <aside className="w-[260px] flex-shrink-0 bg-[#F9F9F9] border-r border-gray-100 p-5 flex flex-col gap-5 overflow-y-auto">
            <div className="flex flex-col gap-2">
              <p className="font-[family-name:var(--font-inter)] font-semibold text-[11px] uppercase tracking-widest"
                 style={{ color: CODELESS_BRAND.colors.coral }}>
                Post
              </p>
              <h3 className="font-[family-name:var(--font-inter)] font-semibold text-[14px] text-[#2E2E2E] leading-snug">
                {post.headline}
              </h3>
              <p className="font-[family-name:var(--font-inter)] text-[12px] text-gray-500 leading-relaxed line-clamp-3">
                {post.caption}
              </p>
              <p className="font-[family-name:var(--font-inter)] text-[12px] font-medium"
                 style={{ color: CODELESS_BRAND.colors.coral }}>
                {post.cta}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-[family-name:var(--font-inter)] font-semibold text-[11px] uppercase tracking-widest"
                 style={{ color: CODELESS_BRAND.colors.coral }}>
                Color Theme
              </p>
              <div className="flex gap-2 flex-wrap">
                {COLOR_THEMES.map((theme) => (
                  <button
                    key={theme.themeKey}
                    onClick={() => setSelectedTheme(theme)}
                    title={theme.label}
                    className="w-9 h-9 rounded-lg transition-all"
                    style={{
                      backgroundColor: theme.color,
                      border:        selectedTheme.themeKey === theme.themeKey ? "3px solid #2E2E2E" : "2px solid transparent",
                      outline:       selectedTheme.themeKey === theme.themeKey ? "2px solid white" : "none",
                      outlineOffset: -4,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="text-[11px] font-[family-name:var(--font-inter)] text-gray-400 mt-auto">
              Exports at 1080×1080px<br />
              Rendered with Puppeteer — pixel-perfect
            </div>
          </aside>

          {/* CENTER — live React preview */}
          <div className="flex-1 bg-[#E5E5E5] flex items-center justify-center overflow-hidden">
            <div
              style={{
                width:     1080 * PREVIEW_SCALE,
                height:    1080 * PREVIEW_SCALE,
                overflow:  "hidden",
                position:  "relative",
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  transform:       `scale(${PREVIEW_SCALE})`,
                  transformOrigin: "top left",
                  width:           1080,
                  height:          1080,
                  pointerEvents:   "none",
                }}
              >
                <TemplateComponent {...templateProps} />
              </div>
            </div>
          </div>

          {/* RIGHT — export */}
          <aside className="w-[220px] flex-shrink-0 bg-[#F9F9F9] border-l border-gray-100 p-5 flex flex-col gap-3">
            <p className="font-[family-name:var(--font-inter)] font-semibold text-[11px] uppercase tracking-widest"
               style={{ color: CODELESS_BRAND.colors.coral }}>
              Export
            </p>

            <button
              onClick={() => handleExport("png")}
              disabled={exporting}
              className="w-full h-10 rounded-lg font-[family-name:var(--font-inter)] font-semibold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: CODELESS_BRAND.colors.darkGray, color: "white" }}
            >
              {exporting ? <Loader2 size={14} className="animate-spin" /> : null}
              Export as PNG
            </button>

            <button
              onClick={() => handleExport("jpeg")}
              disabled={exporting}
              className="w-full h-10 rounded-lg font-[family-name:var(--font-inter)] font-semibold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: CODELESS_BRAND.colors.coral, color: CODELESS_BRAND.colors.darkGray }}
            >
              {exporting ? <Loader2 size={14} className="animate-spin" /> : null}
              Export as JPG
            </button>

            <div className="border-t border-gray-200 pt-3 mt-1">
              <button
                onClick={onEditInCanvas}
                className="w-full font-[family-name:var(--font-inter)] text-sm text-gray-500 hover:text-gray-700 transition-colors text-left"
              >
                Edit in Canvas →
              </button>
            </div>

            {exporting && (
              <p className="text-[11px] text-gray-400 font-[family-name:var(--font-inter)] text-center">
                Puppeteer rendering…
              </p>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
