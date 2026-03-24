"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { GeneratedPost } from "@/types"
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
import { CODELESS_BRAND } from "@/lib/brand"

interface TemplateSelectorProps {
  post: GeneratedPost
  platform: "instagram" | "linkedin" | "facebook"
  onSelect: (templateId: string) => void
  onSkip: () => void
}

const TEMPLATES = [
  { id: "bold-statement",    name: "Bold Statement",   best: "Announcements, quotes",    Component: BoldStatement    },
  { id: "split-layout",      name: "Split Layout",     best: "Posts with photos",        Component: SplitLayout      },
  { id: "gradient-overlay",  name: "Gradient Overlay", best: "Instagram feed posts",     Component: GradientOverlay  },
  { id: "geometric-bold",    name: "Geometric Bold",   best: "Bold brand statements",    Component: GeometricBold    },
  { id: "big-quote",         name: "Big Quote",        best: "Testimonials, quotes",     Component: BigQuote         },
  { id: "stat-card",         name: "Stat Card",        best: "Numbers, milestones",      Component: StatCard         },
  { id: "before-after",      name: "Before / After",   best: "Transformation stories",   Component: BeforeAfter      },
  { id: "checklist",         name: "Checklist",        best: "Myth-busting posts",       Component: Checklist        },
  { id: "typography-poster", name: "Type Poster",      best: "Bold statements",          Component: TypographyPoster },
  { id: "minimal-card",      name: "Minimal Card",     best: "Strong copy",              Component: MinimalCard      },
]

const PREVIEW_SCALE = 240 / 1080

export default function TemplateSelector({ post, platform, onSelect, onSkip }: TemplateSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null)

  const templateProps = {
    headline: post.headline,
    caption:  post.caption,
    cta:      post.cta,
    hashtags: post.hashtags,
    imageUrl: post.imageUrl,
    platform,
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl flex flex-col overflow-hidden shadow-2xl" style={{ maxHeight: "90vh" }}>

        {/* Header */}
        <div className="h-14 border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
          <h2 className="font-[family-name:var(--font-inter)] font-semibold text-[18px] text-[#2E2E2E]">
            Choose a Template
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={onSkip}
              className="font-[family-name:var(--font-inter)] text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              skip to canvas →
            </button>
            <button onClick={onSkip} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable grid — 2 columns, 5 rows */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {TEMPLATES.map(({ id, name, best, Component }) => (
              <div
                key={id}
                onClick={() => setSelected(id)}
                className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${
                  selected === id
                    ? "border-[#FD8D6E] shadow-lg shadow-[#FD8D6E]/20"
                    : "border-gray-200 hover:border-[#FD8D6E]/50"
                }`}
              >
                {/* Scaled preview */}
                <div
                  style={{ width: 240, height: 240 }}
                  className="overflow-hidden relative flex-shrink-0"
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
                    <Component {...templateProps} />
                  </div>
                </div>

                {/* Label */}
                <div className="p-2.5 border-t border-gray-100 bg-white">
                  <p className="font-[family-name:var(--font-inter)] font-semibold text-[12px] text-[#2E2E2E] leading-tight">
                    {name}
                  </p>
                  <p className="font-[family-name:var(--font-inter)] text-[10px] text-gray-400 mt-0.5 leading-tight">
                    {best}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={onSkip}
            className="font-[family-name:var(--font-inter)] text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip — Go to Canvas
          </button>
          <button
            disabled={!selected}
            onClick={() => selected && onSelect(selected)}
            className="font-[family-name:var(--font-inter)] font-semibold text-sm px-6 py-2.5 rounded-lg transition-opacity disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90"
            style={{ backgroundColor: CODELESS_BRAND.colors.coral, color: CODELESS_BRAND.colors.darkGray }}
          >
            Use This Template →
          </button>
        </div>
      </div>
    </div>
  )
}
