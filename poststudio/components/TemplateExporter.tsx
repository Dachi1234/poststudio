"use client"

import { useState } from "react"
import { X, Loader2, Download, BookmarkCheck, Bookmark, Pencil } from "lucide-react"
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
  postDbId?: string
  onExported: (dataUrl: string) => void
  onEditInCanvas: (templateId: string, colorTheme: string) => void
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
  post, platform, templateId, postDbId, onExported, onEditInCanvas, onClose,
}: TemplateExporterProps) {
  const [selectedTheme, setSelectedTheme] = useState(COLOR_THEMES[0])
  const [exporting, setExporting]         = useState(false)
  const [saving, setSaving]               = useState(false)
  const [saved, setSaved]                 = useState(false)

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

  // Reset saved indicator when theme changes
  function handleThemeChange(theme: typeof COLOR_THEMES[0]) {
    setSelectedTheme(theme)
    setSaved(false)
  }

  async function handleSave() {
    if (!postDbId) {
      toast.error("Post not linked to DB — try regenerating")
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/posts/${postDbId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          colorTheme: selectedTheme.themeKey,
          isSaved: true,
        }),
      })
      if (!res.ok) throw new Error()
      setSaved(true)
      toast.success("Post saved to history!")
    } catch {
      toast.error("Failed to save")
    } finally {
      setSaving(false)
    }
  }

  async function handleExport(format: "png" | "jpeg") {
    setExporting(true)
    try {
      const blob = await exportTemplate({
        templateId,
        post: {
          headline: post.headline,
          caption:  post.caption,
          cta:      post.cta,
          hashtags: post.hashtags,
          imageUrl: post.imageUrl,
        },
        platform,
        colorTheme: selectedTheme.themeKey,
        format,
      })

      const url  = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.download = `poststudio-post.${format === "jpeg" ? "jpg" : "png"}`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)

      // Auto-save when exporting
      if (postDbId) {
        fetch(`/api/posts/${postDbId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateId,
            colorTheme: selectedTheme.themeKey,
            isSaved: true,
            exportedAt: new Date().toISOString(),
          }),
        }).catch(() => {})
        setSaved(true)
      }

      toast.success(`Downloaded as ${format.toUpperCase()}`)
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
          <span className="font-semibold text-sm text-[#2E2E2E]">{templateName}</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* LEFT — post info + theme picker */}
          <aside className="w-[240px] flex-shrink-0 bg-[#F9F9F9] border-r border-gray-100 p-5 flex flex-col gap-5 overflow-y-auto">
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#FD8D6E]">Headline</p>
              <h3 className="font-semibold text-[13px] text-[#2E2E2E] leading-snug">{post.headline}</h3>
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#FD8D6E]">Caption</p>
              <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-4">{post.caption}</p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#FD8D6E]">Color Theme</p>
              <div className="flex gap-2 flex-wrap">
                {COLOR_THEMES.map((theme) => (
                  <button
                    key={theme.themeKey}
                    onClick={() => handleThemeChange(theme)}
                    title={theme.label}
                    className="w-9 h-9 rounded-lg transition-all"
                    style={{
                      backgroundColor: theme.color,
                      border:     selectedTheme.themeKey === theme.themeKey ? "3px solid #2E2E2E" : "2px solid transparent",
                      outline:    selectedTheme.themeKey === theme.themeKey ? "2px solid white" : "none",
                      outlineOffset: -4,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="text-[10px] text-gray-400 mt-auto leading-relaxed">
              Exports at 1080×1080 px<br />
              Rendered with Puppeteer
            </div>
          </aside>

          {/* CENTER — live preview */}
          <div className="flex-1 bg-[#E8E8E8] flex items-center justify-center overflow-hidden">
            <div
              style={{
                width:        1080 * PREVIEW_SCALE,
                height:       1080 * PREVIEW_SCALE,
                overflow:     "hidden",
                position:     "relative",
                borderRadius: 8,
                boxShadow:    "0 20px 60px rgba(0,0,0,0.25)",
              }}
            >
              <div
                style={{
                  transform:       `scale(${PREVIEW_SCALE})`,
                  transformOrigin: "top left",
                  width:  1080,
                  height: 1080,
                  pointerEvents: "none",
                }}
              >
                <TemplateComponent {...templateProps} />
              </div>
            </div>
          </div>

          {/* RIGHT — actions */}
          <aside className="w-[200px] flex-shrink-0 bg-[#F9F9F9] border-l border-gray-100 p-5 flex flex-col gap-3">

            {/* SAVE — primary action */}
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={`w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                saved
                  ? "bg-green-500/10 text-green-600 border border-green-500/30"
                  : "bg-[#2E2E2E] hover:bg-[#1a1a1a] text-white"
              } disabled:opacity-60`}
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : saved ? (
                <BookmarkCheck size={14} />
              ) : (
                <Bookmark size={14} />
              )}
              {saved ? "Saved!" : "Save to History"}
            </button>

            <div className="border-t border-gray-200 pt-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] mb-2">
                Download
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleExport("png")}
                  disabled={exporting}
                  className="w-full h-9 rounded-lg border border-gray-200 hover:bg-gray-50 text-[#2E2E2E] font-medium text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {exporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                  PNG
                </button>

                <button
                  onClick={() => handleExport("jpeg")}
                  disabled={exporting}
                  className="w-full h-9 rounded-lg border border-gray-200 hover:bg-gray-50 text-[#2E2E2E] font-medium text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {exporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                  JPG
                </button>
              </div>

              {exporting && (
                <p className="text-[10px] text-gray-400 text-center mt-2">Rendering…</p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-3">
              <button
                onClick={() => onEditInCanvas(templateId, selectedTheme.themeKey)}
                className="w-full flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
              >
                <Pencil size={12} />
                Edit in canvas
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
