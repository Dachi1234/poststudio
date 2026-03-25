"use client"

import { Type, Square, Circle, Image as ImageIcon, Minus, ChevronUp, ChevronDown, Trash2, Lock, Unlock, Eye, EyeOff } from "lucide-react"

export interface Layer {
  id:      string
  type:    string
  label:   string
  locked:  boolean
  visible: boolean
}

interface LayersPanelProps {
  layers:    Layer[]
  selectedId: string | null
  onSelect:   (id: string) => void
  onMoveUp:   (id: string) => void
  onMoveDown: (id: string) => void
  onDelete:   (id: string) => void
  onToggleLock:    (id: string) => void
  onToggleVisible: (id: string) => void
}

function typeIcon(type: string) {
  if (type === "i-text" || type === "textbox" || type === "text") return <Type size={11} />
  if (type === "rect")   return <Square size={11} />
  if (type === "circle" || type === "ellipse") return <Circle size={11} />
  if (type === "image")  return <ImageIcon size={11} />
  return <Minus size={11} />
}

export default function LayersPanel({
  layers, selectedId, onSelect, onMoveUp, onMoveDown,
  onDelete, onToggleLock, onToggleVisible,
}: LayersPanelProps) {
  // Reverse so top layer is at top of list
  const reversed = [...layers].reverse()

  return (
    <div className="h-14 bg-[#111] border-t border-[#2a2a2a] flex items-center gap-1 px-3 overflow-x-auto flex-shrink-0">
      <span className="text-[#444] text-[10px] font-semibold uppercase tracking-wider mr-2 flex-shrink-0">
        Layers
      </span>

      {reversed.length === 0 && (
        <span className="text-[#333] text-xs">No objects</span>
      )}

      {reversed.map((layer, i) => {
        const isSelected = layer.id === selectedId
        const originalIdx = layers.length - 1 - i

        return (
          <div
            key={layer.id}
            onClick={() => onSelect(layer.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg cursor-pointer flex-shrink-0 transition-all group ${
              isSelected
                ? "bg-[#FD8D6E]/15 border border-[#FD8D6E]/30"
                : "bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#444]"
            }`}
          >
            <span className={isSelected ? "text-[#FD8D6E]" : "text-[#555]"}>
              {typeIcon(layer.type)}
            </span>
            <span className={`text-[11px] max-w-[80px] truncate ${isSelected ? "text-white" : "text-[#888]"}`}>
              {layer.label}
            </span>

            {/* Actions (visible on hover or selected) */}
            <div className={`flex items-center gap-0.5 ml-1 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
              <button
                onClick={(e) => { e.stopPropagation(); onMoveUp(layer.id) }}
                disabled={originalIdx === layers.length - 1}
                className="w-4 h-4 text-[#555] hover:text-white disabled:opacity-20 transition-colors"
                title="Bring forward"
              >
                <ChevronUp size={11} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onMoveDown(layer.id) }}
                disabled={originalIdx === 0}
                className="w-4 h-4 text-[#555] hover:text-white disabled:opacity-20 transition-colors"
                title="Send backward"
              >
                <ChevronDown size={11} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleVisible(layer.id) }}
                className="w-4 h-4 text-[#555] hover:text-white transition-colors"
                title={layer.visible ? "Hide" : "Show"}
              >
                {layer.visible ? <Eye size={11} /> : <EyeOff size={11} />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleLock(layer.id) }}
                className="w-4 h-4 text-[#555] hover:text-white transition-colors"
                title={layer.locked ? "Unlock" : "Lock"}
              >
                {layer.locked ? <Lock size={11} /> : <Unlock size={11} />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(layer.id) }}
                className="w-4 h-4 text-[#555] hover:text-red-400 transition-colors"
                title="Delete"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
