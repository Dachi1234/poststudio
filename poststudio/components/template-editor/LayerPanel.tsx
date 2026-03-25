"use client"

import { Layers, Lock, Unlock, Eye, EyeOff, Type, Heading, MessageSquare } from "lucide-react"
import type { ElementOverride, FieldInfo } from "./types"

interface LayerPanelProps {
  fields: FieldInfo[]
  overrides: Record<string, ElementOverride>
  selectedField: string | null
  onSelect: (field: string) => void
  onToggleLock: (field: string) => void
  onToggleVisibility: (field: string) => void
}

const FIELD_ICONS: Record<string, typeof Type> = {
  headline: Heading,
  cta: MessageSquare,
  caption: Type,
}

function getFieldIcon(field: string) {
  const Icon = FIELD_ICONS[field] || Type
  return <Icon size={12} />
}

function getFieldLabel(info: FieldInfo) {
  const labels: Record<string, string> = {
    headline: "Headline",
    cta: "Call to Action",
    caption: "Caption",
    hashtags: "Hashtags",
  }
  return labels[info.field] || info.field
}

export default function LayerPanel({
  fields,
  overrides,
  selectedField,
  onSelect,
  onToggleLock,
  onToggleVisibility,
}: LayerPanelProps) {
  if (fields.length === 0) {
    return (
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-3">
          <Layers size={12} className="text-[#555]" />
          <p className="text-[#555] text-[10px] font-semibold uppercase tracking-wider">Layers</p>
        </div>
        <p className="text-[#333] text-[10px]">No editable elements found</p>
      </div>
    )
  }

  return (
    <div className="p-3">
      <div className="flex items-center gap-1.5 mb-3">
        <Layers size={12} className="text-[#555]" />
        <p className="text-[#555] text-[10px] font-semibold uppercase tracking-wider">Layers</p>
      </div>

      <div className="flex flex-col gap-0.5">
        {fields.map((info) => {
          const ov = overrides[info.field]
          const isSelected = selectedField === info.field
          const isLocked = ov?.locked ?? false
          const isHidden = ov?.opacity === 0

          return (
            <div
              key={info.field}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (!isLocked) onSelect(info.field)
              }}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all group select-none ${
                isSelected
                  ? "bg-[#FD8D6E]/15 border border-[#FD8D6E]/30"
                  : "hover:bg-white/5 border border-transparent"
              } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {/* Icon */}
              <span className={`flex-shrink-0 ${isSelected ? "text-[#FD8D6E]" : "text-[#555]"}`}>
                {getFieldIcon(info.field)}
              </span>

              {/* Label + preview */}
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-medium truncate ${
                  isSelected ? "text-[#FD8D6E]" : "text-[#999]"
                }`}>
                  {getFieldLabel(info)}
                </p>
                <p className="text-[9px] text-[#444] truncate">
                  {(ov?.text || info.text).slice(0, 30)}
                  {(ov?.text || info.text).length > 30 ? "..." : ""}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); onToggleVisibility(info.field) }}
                  className="w-5 h-5 rounded flex items-center justify-center text-[#555] hover:text-white hover:bg-white/10 transition-all"
                  title={isHidden ? "Show" : "Hide"}
                >
                  {isHidden ? <EyeOff size={10} /> : <Eye size={10} />}
                </button>
                <button
                  onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); onToggleLock(info.field) }}
                  className="w-5 h-5 rounded flex items-center justify-center text-[#555] hover:text-white hover:bg-white/10 transition-all"
                  title={isLocked ? "Unlock" : "Lock"}
                >
                  {isLocked ? <Lock size={10} /> : <Unlock size={10} />}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
