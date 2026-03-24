"use client"

import { useState } from "react"
import Image from "next/image"
import { CODELESS_BRAND, PLATFORM_SIZES } from "@/lib/brand"
import { generateImage } from "@/lib/api"
import { GeneratedPost } from "@/types"
import { toast } from "sonner"

interface PostCardProps {
  post: GeneratedPost
  platform: "instagram" | "linkedin" | "facebook"
  index: number
  onEdit: () => void
  onChooseTemplate: () => void
  onImageUpdate: (id: string, imageUrl: string, imageModel: string) => void
}

type ImageModel =
  | "flux"
  | "nano-banana"
  | "flux-pro"
  | "nano-banana-pro"
  | "recraft"
  | "ideogram"

const MODEL_NAMES: Record<ImageModel, string> = {
  "flux":            "FLUX Schnell",
  "flux-pro":        "FLUX Pro",
  "recraft":         "Recraft v3",
  "ideogram":        "Ideogram",
  "nano-banana":     "Nano Banana 2",
  "nano-banana-pro": "Nano Banana Pro",
}

const MODEL_ETA: Record<ImageModel, number> = {
  "flux":            5,
  "nano-banana":     8,
  "flux-pro":        15,
  "nano-banana-pro": 20,
  "recraft":         10,
  "ideogram":        15,
}

const MODEL_EMOJI: Record<ImageModel, string> = {
  "flux":            "⚡",
  "nano-banana":     "🍌",
  "flux-pro":        "📸",
  "nano-banana-pro": "🍌",
  "recraft":         "🎨",
  "ideogram":        "✦",
}

const MODEL_STYLE: Record<ImageModel, string> = {
  "flux":            "bg-white border-gray-200 text-[#2E2E2E]",
  "nano-banana":     "bg-[#4ECB71]/10 border-[#4ECB71]/40 text-[#2E2E2E]",
  "flux-pro":        "bg-[#5A8DEE]/10 border-[#5A8DEE]/30 text-[#5A8DEE]",
  "nano-banana-pro": "bg-[#4ECB71]/20 border-[#4ECB71]/60 text-[#2E2E2E]",
  "recraft":         "bg-[#FD8D6E]/10 border-[#FD8D6E]/30 text-[#FD8D6E]",
  "ideogram":        "bg-[#FFD95A]/20 border-[#FFD95A]/50 text-[#2E2E2E]",
}

const ROWS: Array<{ label: string; models: [ImageModel, ImageModel] }> = [
  { label: "FAST",    models: ["flux",     "nano-banana"]     },
  { label: "QUALITY", models: ["flux-pro", "nano-banana-pro"] },
  { label: "STYLE",   models: ["recraft",  "ideogram"]        },
]

const MODEL_SUBTITLE: Record<ImageModel, string> = {
  "flux":            "Fast preview · ~5s",
  "nano-banana":     "Google · Fast · ~8s",
  "flux-pro":        "Best realism · ~15s",
  "nano-banana-pro": "Best text+design · ~20s",
  "recraft":         "Graphic style · ~10s",
  "ideogram":        "Text in image · ~15s",
}

const platformColors: Record<string, { bg: string; text: string; label: string }> = {
  instagram: { bg: "bg-[#FD8D6E]/20", text: "text-[#FD8D6E]", label: "Instagram" },
  linkedin:  { bg: "bg-[#5A8DEE]/20", text: "text-[#5A8DEE]", label: "LinkedIn"  },
  facebook:  { bg: "bg-blue-500/20",  text: "text-blue-400",   label: "Facebook"  },
}

export default function PostCard({
  post, platform, index, onEdit, onChooseTemplate, onImageUpdate,
}: PostCardProps) {
  const [imageLoading, setImageLoading]   = useState(false)
  const [loadingModel, setLoadingModel]   = useState<ImageModel | null>(null)
  const [imageUrl, setImageUrl]           = useState<string | undefined>(post.imageUrl)
  const [imageModel, setImageModel]       = useState<string | undefined>(post.imageModel)
  const [captionExpanded, setCaptionExpanded] = useState(false)
  const [hoveredRegen, setHoveredRegen]   = useState<ImageModel | null>(null)

  const platformInfo = platformColors[platform]
  const platformSize = PLATFORM_SIZES[platform]
  const aspectClass  = platform === "instagram" ? "aspect-square" : "aspect-video"

  async function handleGenerate(model: ImageModel) {
    setImageLoading(true)
    setLoadingModel(model)
    try {
      const data = await generateImage({
        model,
        prompt: post.imagePrompt,
        platform,
      })
      setImageUrl(data.imageUrl)
      setImageModel(model)
      onImageUpdate(post.id, data.imageUrl, model)
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
          /* ── LOADING STATE ── */
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
                ~{MODEL_ETA[loadingModel]} seconds
              </p>
            )}
            <button
              onClick={() => { setImageLoading(false); setLoadingModel(null) }}
              className="font-[family-name:var(--font-inter)] text-[11px] text-gray-400 hover:text-gray-600 transition-colors mt-1"
            >
              Cancel
            </button>
          </div>

        ) : imageUrl ? (
          /* ── IMAGE EXISTS ── */
          <>
            <Image
              src={imageUrl}
              alt={post.headline}
              fill
              className="object-cover"
              sizes={`${platformSize.width}px`}
            />

            {/* Model badge — top right */}
            {imageModel && (
              <span className="absolute top-0 right-0 font-[family-name:var(--font-space-mono)] text-[9px] bg-black/60 text-white px-2 py-1 rounded-bl-lg rounded-tr-lg">
                {MODEL_NAMES[imageModel as ImageModel] ?? imageModel}
              </span>
            )}

            {/* Regen mini-buttons — bottom left */}
            <div className="absolute bottom-2 left-2 flex gap-1">
              {(Object.keys(MODEL_NAMES) as ImageModel[]).map((model) => (
                <div key={model} className="relative">
                  <button
                    onClick={() => handleGenerate(model)}
                    onMouseEnter={() => setHoveredRegen(model)}
                    onMouseLeave={() => setHoveredRegen(null)}
                    className="w-7 h-7 bg-white/90 border border-white/50 rounded-md flex items-center justify-center text-[13px] hover:bg-white transition-colors shadow-sm backdrop-blur-sm"
                    title={MODEL_NAMES[model]}
                  >
                    {MODEL_EMOJI[model]}
                  </button>
                  {hoveredRegen === model && (
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 font-[family-name:var(--font-space-mono)] text-[9px] bg-black/80 text-white px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none">
                      {MODEL_NAMES[model]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>

        ) : (
          /* ── NO IMAGE — GENERATION GRID ── */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-5 py-4">
            <p
              className="font-[family-name:var(--font-space-mono)] text-[11px] uppercase tracking-widest mb-1"
              style={{ color: CODELESS_BRAND.colors.coral }}
            >
              Generate Image
            </p>

            <div className="w-full flex flex-col gap-2">
              {ROWS.map(({ label, models }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className="font-[family-name:var(--font-inter)] text-[10px] text-gray-400 uppercase tracking-wider px-0.5">
                    {label}
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {models.map((model) => (
                      <button
                        key={model}
                        onClick={() => handleGenerate(model)}
                        className={`rounded-lg p-3 text-left border transition-all hover:opacity-80 cursor-pointer ${MODEL_STYLE[model]}`}
                      >
                        <p className="font-[family-name:var(--font-inter)] font-semibold text-[12px] leading-tight">
                          {MODEL_EMOJI[model]} {MODEL_NAMES[model]}
                        </p>
                        <p className="font-[family-name:var(--font-inter)] text-[10px] opacity-50 mt-0.5">
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

        {/* Platform badge — top left */}
        <span className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-0.5 rounded-full backdrop-blur-sm ${platformInfo.bg} ${platformInfo.text}`}>
          {platformInfo.label}
        </span>

        {/* Variation number — top right (hidden when image has model badge) */}
        {!imageModel && (
          <span className="absolute top-3 right-3 font-[family-name:var(--font-space-mono)] text-[11px] bg-black/40 text-white/70 px-1.5 py-0.5 rounded backdrop-blur-sm">
            #{index + 1}
          </span>
        )}
      </div>

      {/* ── TEXT CONTENT ── */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        <h3
          className="font-[family-name:var(--font-inter)] font-semibold text-[17px] leading-snug"
          style={{ color: CODELESS_BRAND.colors.darkGray }}
        >
          {post.headline}
        </h3>

        <div>
          <p
            className={`font-[family-name:var(--font-inter)] text-sm leading-relaxed ${!captionExpanded ? "line-clamp-3" : ""}`}
            style={{ color: `${CODELESS_BRAND.colors.darkGray}BF` }}
          >
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
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full font-[family-name:var(--font-inter)]"
              style={{ backgroundColor: `${CODELESS_BRAND.colors.coral}1A`, color: CODELESS_BRAND.colors.coral }}
            >
              #{tag}
            </span>
          ))}
        </div>

        <button
          className="border text-sm px-4 py-1.5 rounded-md w-fit hover:opacity-80 transition-opacity font-[family-name:var(--font-inter)]"
          style={{ borderColor: CODELESS_BRAND.colors.coral, color: CODELESS_BRAND.colors.coral }}
        >
          {post.cta}
        </button>

        {/* Bottom action row */}
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
