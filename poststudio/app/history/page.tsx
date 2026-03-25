"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Download, Trash2, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import BoldStatement    from "@/components/templates/BoldStatement"
import SplitLayout      from "@/components/templates/SplitLayout"
import GradientOverlay  from "@/components/templates/GradientOverlay"
import GeometricBold    from "@/components/templates/GeometricBold"
import BigQuote         from "@/components/templates/BigQuote"
import StatCard         from "@/components/templates/StatCard"
import BeforeAfter      from "@/components/templates/BeforeAfter"
import Checklist        from "@/components/templates/Checklist"
import TypographyPoster from "@/components/templates/TypographyPoster"
import MinimalCard      from "@/components/templates/MinimalCard"
import { exportTemplate } from "@/lib/api"

// ─── Types ───────────────────────────────────────────────────────────────────

interface SavedPost {
  id: string
  platform: string
  headline: string
  caption: string
  hashtags: string[]
  cta: string
  imageUrl?: string
  templateId: string
  colorTheme?: string
  exportedAt?: string
  createdAt: string
  brand: { id: string; name: string; primaryColor: string }
}

// ─── Template registry ───────────────────────────────────────────────────────

type AnyTemplateProps = {
  headline: string; caption: string; cta: string; hashtags: string[]
  imageUrl?: string; platform: "instagram" | "linkedin" | "facebook"; primaryColor?: string
}

const TEMPLATES: Record<string, React.ComponentType<AnyTemplateProps>> = {
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
  "bold-statement": "Bold Statement", "split-layout": "Split Layout",
  "gradient-overlay": "Gradient Overlay", "geometric-bold": "Geometric Bold",
  "big-quote": "Big Quote", "stat-card": "Stat Card",
  "before-after": "Before / After", "checklist": "Checklist",
  "typography-poster": "Type Poster", "minimal-card": "Minimal Card",
}

const THEME_COLORS: Record<string, string> = {
  coral:  "#FD8D6E",
  blue:   "#5A8DEE",
  dark:   "#2E2E2E",
  yellow: "#FFD95A",
}

// Expanded lightbox preview size
const EXPANDED_SIZE  = 540
const EXPANDED_SCALE = EXPANDED_SIZE / 1080

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

// ─── Thumbnail component ─────────────────────────────────────────────────────

function TemplateThumbnail({ post }: { post: SavedPost }) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(240)

  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([entry]) => {
      setSize(entry.contentRect.width)
    })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  const Component = TEMPLATES[post.templateId]
  const primaryColor = THEME_COLORS[post.colorTheme ?? "coral"] ?? "#FD8D6E"
  const scale = size / 1080

  return (
    <div
      ref={ref}
      className="w-full overflow-hidden rounded-xl"
      style={{ aspectRatio: "1 / 1" }}
    >
      {Component ? (
        <div
          style={{
            transform:       `scale(${scale})`,
            transformOrigin: "top left",
            width:           1080,
            height:          1080,
            pointerEvents:   "none",
          }}
        >
          <Component
            headline={post.headline}
            caption={post.caption}
            cta={post.cta}
            hashtags={post.hashtags}
            imageUrl={post.imageUrl}
            platform={post.platform as "instagram" | "linkedin" | "facebook"}
            primaryColor={primaryColor}
          />
        </div>
      ) : (
        <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center text-[#444] text-xs">
          Unknown template
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const [posts, setPosts]       = useState<SavedPost[]>([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [exporting, setExporting] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((d) => { setPosts(d.posts ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleExport(post: SavedPost, format: "png" | "jpeg") {
    setExporting(post.id + format)
    try {
      const blob = await exportTemplate({
        templateId: post.templateId,
        post: { headline: post.headline, caption: post.caption, cta: post.cta, hashtags: post.hashtags, imageUrl: post.imageUrl },
        platform: post.platform,
        colorTheme: post.colorTheme ?? "coral",
        format,
      })
      const url  = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.download = `poststudio-${post.id.slice(-6)}.${format === "jpeg" ? "jpg" : "png"}`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
      toast.success(`Downloaded as ${format.toUpperCase()}`)
    } catch {
      toast.error("Export failed — make sure the backend is running")
    } finally {
      setExporting(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this post from history?")) return
    try {
      // Just unset isSaved + templateId so it disappears from history
      await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: null }),
      })
      setPosts((p) => p.filter((x) => x.id !== id))
      toast.success("Removed from history")
    } catch {
      toast.error("Failed to remove")
    }
  }

  const expandedPost = posts.find((p) => p.id === expanded)
  const EXPANDED_SIZE = 540
  const EXPANDED_SCALE = EXPANDED_SIZE / 1080

  return (
    <main className="min-h-screen bg-[#111]">
      {/* Header */}
      <div className="px-8 pt-10 pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-white text-3xl font-bold tracking-tight">Saved Posts</h1>
          <p className="text-[#555] text-sm mt-1">
            {loading ? "Loading…" : posts.length === 0
              ? "No saved posts yet"
              : `${posts.length} post${posts.length !== 1 ? "s" : ""} saved`}
          </p>
        </div>
        <Link
          href="/create"
          className="bg-[#FD8D6E] hover:bg-[#fc7a57] text-white font-semibold rounded-lg px-5 py-2.5 text-sm transition-colors"
        >
          + Create post
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="px-8 grid grid-cols-2 md:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-[#1a1a1a] animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 gap-5">
          <div className="text-6xl opacity-20">🖼</div>
          <p className="text-[#444] text-base">No saved posts yet</p>
          <Link href="/create" className="text-[#FD8D6E] text-sm hover:underline">
            Create your first post →
          </Link>
        </div>
      ) : (
        <div className="px-8 pb-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {posts.map((post) => (
            <div
              key={post.id}
              className="group relative cursor-pointer"
              onClick={() => setExpanded(expanded === post.id ? null : post.id)}
            >
              {/* Template preview */}
              <div className="overflow-hidden rounded-xl ring-2 ring-transparent group-hover:ring-[#FD8D6E]/50 transition-all">
                <TemplateThumbnail post={post} />
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/30 transition-all flex items-end">
                <div className="w-full p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                  <p className="text-white text-xs font-semibold truncate drop-shadow">{post.headline}</p>
                  <p className="text-white/70 text-[10px] mt-0.5 drop-shadow">
                    {TEMPLATE_NAMES[post.templateId]} · {post.platform}
                  </p>
                </div>
              </div>

              {/* Brand dot + date — always visible below card */}
              <div className="flex items-center gap-1.5 mt-2 px-0.5">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: post.brand?.primaryColor ?? "#FD8D6E" }}
                />
                <span className="text-[#555] text-[10px] truncate">{post.brand?.name}</span>
                <span className="text-[#333] text-[10px] ml-auto">{formatDate(post.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Expanded view lightbox ── */}
      {expandedPost && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-6"
          onClick={() => setExpanded(null)}
        >
          <div
            className="bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: expandedPost.brand?.primaryColor ?? "#FD8D6E" }}
                />
                <span className="text-white text-sm font-medium">{expandedPost.headline}</span>
              </div>
              <button
                onClick={() => setExpanded(null)}
                className="text-[#555] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Template preview (large) */}
            <div className="bg-[#111] flex items-center justify-center p-6">
              <div
                className="overflow-hidden rounded-xl shadow-2xl"
                style={{ width: EXPANDED_SIZE, height: EXPANDED_SIZE }}
              >
                <div
                  style={{
                    transform:       `scale(${EXPANDED_SCALE})`,
                    transformOrigin: "top left",
                    width:  1080,
                    height: 1080,
                    pointerEvents: "none",
                  }}
                >
                  {(() => {
                    const C = TEMPLATES[expandedPost.templateId]
                    const color = THEME_COLORS[expandedPost.colorTheme ?? "coral"] ?? "#FD8D6E"
                    return C ? (
                      <C
                        headline={expandedPost.headline}
                        caption={expandedPost.caption}
                        cta={expandedPost.cta}
                        hashtags={expandedPost.hashtags}
                        imageUrl={expandedPost.imageUrl}
                        platform={expandedPost.platform as "instagram" | "linkedin" | "facebook"}
                        primaryColor={color}
                      />
                    ) : null
                  })()}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-4 border-t border-[#2a2a2a] flex items-center gap-3">
              <button
                onClick={() => handleExport(expandedPost, "png")}
                disabled={!!exporting}
                className="flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#333] text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
              >
                <Download size={13} />
                {exporting === expandedPost.id + "png" ? "Exporting…" : "PNG"}
              </button>
              <button
                onClick={() => handleExport(expandedPost, "jpeg")}
                disabled={!!exporting}
                className="flex items-center gap-2 bg-[#FD8D6E] hover:bg-[#fc7a57] text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
              >
                <Download size={13} />
                {exporting === expandedPost.id + "jpeg" ? "Exporting…" : "JPG"}
              </button>

              <div className="flex items-center gap-2 ml-auto text-[#555] text-xs">
                <span>{TEMPLATE_NAMES[expandedPost.templateId]}</span>
                <span>·</span>
                <span className="capitalize">{expandedPost.platform}</span>
                {expandedPost.exportedAt && (
                  <>
                    <span>·</span>
                    <ExternalLink size={10} className="text-green-500" />
                    <span className="text-green-500">Exported</span>
                  </>
                )}
              </div>

              <button
                onClick={() => handleDelete(expandedPost.id)}
                className="text-[#444] hover:text-red-400 transition-colors ml-1"
                title="Remove from history"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
