"use client"

import { useState } from "react"
import Image from "next/image"
import { CODELESS_BRAND, PLATFORM_SIZES } from "@/lib/brand"
import { generateImage, type ImageModel, type BrandForGeneration } from "@/lib/api"
import { GeneratedPost } from "@/types"
import { toast } from "sonner"

interface PostCardProps {
  post: GeneratedPost
  platform: "instagram" | "linkedin" | "facebook"
  index: number
  postDbId?: string
  brand?: BrandForGeneration
  onEdit: () => void
  onChooseTemplate: () => void
  onImageUpdate: (id: string, imageUrl: string, imageModel: string) => void
}

/* ── Model metadata ──────────────────────────────────────────────── */

const MODEL_NAMES: Record<ImageModel, string> = {
  "gpt-image":      "GPT Image 1.5",
  "nano-banana-pro":"Nano Banana Pro",
  "flux-2-max":     "FLUX.2 Max",
  "flux-2-pro":     "FLUX.2 Pro",
  "recraft-v4-svg": "Recraft V4 SVG",
  "flux-2-flex":    "FLUX.2 Flex",
  "ideogram-v3":    "Ideogram v3",
  "recraft-v4":     "Recraft V4",
}

const MODEL_ETA: Record<ImageModel, number> = {
  "gpt-image":      12,
  "nano-banana-pro":20,
  "flux-2-max":     25,
  "flux-2-pro":     18,
  "recraft-v4-svg": 15,
  "flux-2-flex":    15,
  "ideogram-v3":    15,
  "recraft-v4":     12,
}

const MODEL_EMOJI: Record<ImageModel, string> = {
  "gpt-image":      "✦",
  "nano-banana-pro":"🍌",
  "flux-2-max":     "⚡",
  "flux-2-pro":     "📸",
  "recraft-v4-svg": "⟨/⟩",
  "flux-2-flex":    "💫",
  "ideogram-v3":    "🅰",
  "recraft-v4":     "🎨",
}

const MODEL_SUBTITLE: Record<ImageModel, string> = {
  "gpt-image":      "OpenAI · Multi-modal · ~12s",
  "nano-banana-pro":"Google · Text+design · ~20s",
  "flux-2-max":     "Top quality · ~25s",
  "flux-2-pro":     "Best realism · ~18s",
  "recraft-v4-svg": "Vector SVG · ~15s",
  "flux-2-flex":    "Speed+quality · ~15s",
  "ideogram-v3":    "Text in image · ~15s",
  "recraft-v4":     "Design taste · ~12s",
}

/* bg / border / text colour per model */
const MODEL_STYLE: Record<ImageModel, string> = {
  "gpt-image":      "bg-emerald-50   border-emerald-200   text-emerald-800",
  "nano-banana-pro":"bg-yellow-50    border-yellow-200    text-yellow-800",
  "flux-2-max":     "bg-violet-50    border-violet-200    text-violet-800",
  "flux-2-pro":     "bg-blue-50      border-blue-200      text-blue-800",
  "recraft-v4-svg": "bg-slate-50     border-slate-200     text-slate-700",
  "flux-2-flex":    "bg-sky-50       border-sky-200       text-sky-800",
  "ideogram-v3":    "bg-amber-50     border-amber-200     text-amber-800",
  "recraft-v4":     "bg-rose-50      border-rose-200      text-rose-800",
}

/* 4 rows of 2 */
const ROWS: Array<{ label: string; models: [ImageModel, ImageModel] }> = [
  { label: "ULTRA",  models: ["flux-2-max",     "flux-2-pro"]     },
  { label: "SMART",  models: ["gpt-image",      "ideogram-v3"]    },
  { label: "DESIGN", models: ["recraft-v4",     "recraft-v4-svg"] },
  { label: "FAST",   models: ["flux-2-flex",    "nano-banana-pro"]},
]

const platformColors: Record<string, { bg: string; text: string; label: string }> = {
  instagram: { bg: "bg-[#FD8D6E]/20", text: "text-[#FD8D6E]", label: "Instagram" },
  linkedin:  { bg: "bg-[#5A8DEE]/20", text: "text-[#5A8DEE]", label: "LinkedIn"  },
  facebook:  { bg: "bg-blue-500/20",  text: "text-blue-400",  label: "Facebook"  },
}

/* ─────────────────────────────────────────────────────────────────── */

export default function PostCard({
  post, platform, index, postDbId, brand, onEdit, onChooseTemplate, onImageUpdate,
}: PostCardProps) {
  const [imageLoading, setImageLoading]     = useState(false)
  const [loadingModel, setLoadingModel]     = useState<ImageModel | null>(null)
  const [imageUrl,     setImageUrl]         = useState<string | undefined>(post.imageUrl)
  const [imageModel,   setImageModel]       = useState<string | undefined>(post.imageModel)
  const [captionExpanded, setCaptionExpanded] = useState(false)
  const [hoveredRegen, setHoveredRegen]     = useState<ImageModel | null>(null)

  const platformInfo = platformColors[platform]
  const platformSize = PLATFORM_SIZES[platform]
  const aspectClass  = platform === "instagram" ? "aspect-square" : "aspect-video"

  async function handleGenerate(model: ImageModel) {
    setImageLoading(true)
    setLoadingModel(model)
    try {
      const data = await generateImage({ model, prompt: post.imagePrompt, platform, brand })
      setImageUrl(data.imageUrl)
      setImageModel(model)
      onImageUpdate(post.id, data.imageUrl, model)
      if (postDbId) {
        fetch(`/api/posts/${postDbId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: data.imageUrl, imageModel: model }),
        }).catch(() => {})
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed"
      toast.error(`${MODEL_NAMES[model]} failed — ${msg.slice(0, 60)}`)
    } finally {
      setImageLoading(false)
      setLoadingModel(null)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">

      {/* ── IMAGE AREA ── */}
      <div className={`relative w-full ${aspectClass} bg-gray-100 flex-shrink-0`}>

        {imageLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div
              className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: `${CODELESS_BRAND.colors.coral} transparent transparent transparent` }}
            />
            <p className="font-[family-name:var(--font-inter)] font-medium text-[13px] text-[#2E2E2E]">
              Generating with {loadingModel ? MODEL_NAMES[loadingModel] : "AI"}…
            </p>
            {loadingModel && (
              <p className="font-[family-name:var(--font-inter)] text-[11px] text-[#2E2E2E]/50">
                ~{MODEL_ETA[loadingModel]}s
              </p>
            )}
            <button
              onClick={() => { setImageLoading(false); setLoadingModel(null) }}
              className="font-[family-name:var(--font-inter)] text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>

        ) : imageUrl ? (
          <>
            {imageUrl.endsWith(".svg") ? (
              /* SVG images (Recraft V4 SVG) */
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt={post.headline} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <Image
                src={imageUrl}
                alt={post.headline}
                fill
                className="object-cover"
                sizes={`${platformSize.width}px`}
              />
            )}

            {/* Model badge */}
            {imageModel && (
              <span className="absolute top-0 right-0 font-[family-name:var(--font-space-mono)] text-[9px] bg-black/60 text-white px-2 py-1 rounded-bl-lg rounded-tr-lg">
                {MODEL_NAMES[imageModel as ImageModel] ?? imageModel}
              </span>
            )}

            {/* Re-generate mini buttons */}
            <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap max-w-[90%]">
              {(Object.keys(MODEL_NAMES) as ImageModel[]).map((model) => (
                <div key={model} className="relative">
                  <button
                    onClick={() => handleGenerate(model)}
                    onMouseEnter={() => setHoveredRegen(model)}
                    onMouseLeave={() => setHoveredRegen(null)}
                    className="w-7 h-7 bg-white/90 border border-white/50 rounded-md flex items-center justify-center text-[11px] hover:bg-white transition-colors shadow-sm backdrop-blur-sm"
                    title={MODEL_NAMES[model]}
                  >
                    {MODEL_EMOJI[model]}
                  </button>
                  {hoveredRegen === model && (
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 font-[family-name:var(--font-space-mono)] text-[9px] bg-black/80 text-white px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none z-10">
                      {MODEL_NAMES[model]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>

        ) : (
          /* ── NO IMAGE — MODEL GRID ── */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 px-4 py-4">
            <p className="font-[family-name:var(--font-space-mono)] text-[11px] uppercase tracking-widest"
               style={{ color: CODELESS_BRAND.colors.coral }}>
              Generate Image
            </p>

            <div className="w-full flex flex-col gap-1.5">
              {ROWS.map(({ label, models }) => (
                <div key={label}>
                  <span className="font-[family-name:var(--font-inter)] text-[9px] text-gray-400 uppercase tracking-wider px-0.5">
                    {label}
                  </span>
                  <div className="grid grid-cols-2 gap-1 mt-0.5">
                    {models.map((model) => (
                      <button
                        key={model}
                        onClick={() => handleGenerate(model)}
                        className={`rounded-lg p-2.5 text-left border transition-all hover:opacity-80 cursor-pointer ${MODEL_STYLE[model]}`}
                      >
                        <p className="font-[family-name:var(--font-inter)] font-semibold text-[11px] leading-tight">
                          {MODEL_EMOJI[model]} {MODEL_NAMES[model]}
                        </p>
                        <p className="font-[family-name:var(--font-inter)] text-[10px] opacity-50 mt-0.5 leading-tight">
                          {MODEL_SUBTITLE[model]}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Platform badge */}
        <span className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-0.5 rounded-full backdrop-blur-sm ${platformInfo.bg} ${platformInfo.text}`}>
          {platformInfo.label}
        </span>

        {!imageModel && (
          <span className="absolute top-3 right-3 font-[family-name:var(--font-space-mono)] text-[11px] bg-black/40 text-white/70 px-1.5 py-0.5 rounded backdrop-blur-sm">
            #{index + 1}
          </span>
        )}
      </div>

      {/* ── TEXT CONTENT ── */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        <h3 className="font-[family-name:var(--font-inter)] font-semibold text-[17px] leading-snug"
            style={{ color: CODELESS_BRAND.colors.darkGray }}>
          {post.headline}
        </h3>

        <div>
          <p className={`font-[family-name:var(--font-inter)] text-sm leading-relaxed ${!captionExpanded ? "line-clamp-3" : ""}`}
             style={{ color: `${CODELESS_BRAND.colors.darkGray}BF` }}>
            {post.caption}
          </p>
          {post.caption.length > 150 && (
            <button
              onClick={() => setCaptionExpanded(!captionExpanded)}
              className="text-xs mt-1 font-medium font-[family-name:var(--font-inter)]"
              style={{ color: CODELESS_BRAND.colors.coral }}
            >
              {captionExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {post.hashtags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full font-[family-name:var(--font-inter)]"
                  style={{ backgroundColor: `${CODELESS_BRAND.colors.coral}1A`, color: CODELESS_BRAND.colors.coral }}>
              #{tag}
            </span>
          ))}
        </div>

        <button className="border text-sm px-4 py-1.5 rounded-md w-fit hover:opacity-80 transition-opacity font-[family-name:var(--font-inter)]"
                style={{ borderColor: CODELESS_BRAND.colors.coral, color: CODELESS_BRAND.colors.coral }}>
          {post.cta}
        </button>

        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center gap-3">
          <button
            onClick={onChooseTemplate}
            className="flex-1 text-sm font-[family-name:var(--font-inter)] font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: CODELESS_BRAND.colors.coral, color: CODELESS_BRAND.colors.darkGray }}
          >
            Choose Template →
          </button>
          <button
            onClick={onEdit}
            className="text-sm font-[family-name:var(--font-inter)] hover:opacity-70 transition-opacity"
            style={{ color: `${CODELESS_BRAND.colors.darkGray}60` }}
          >
            Canvas
          </button>
        </div>
      </div>
    </div>
  )
}
