"use client"

import type { ReactNode } from "react"
import { MousePointer2, Type, Square, Circle, ImagePlus, Slash } from "lucide-react"

export type ActiveTool = "select" | "text" | "rect" | "circle" | "line"

interface ToolBarProps {
  activeTool: ActiveTool
  onToolChange: (tool: ActiveTool) => void
  onAddImage: () => void
}

const tools: Array<{ id: ActiveTool | "image"; icon: ReactNode; label: string }> = [
  { id: "select",  icon: <MousePointer2 size={17} />, label: "Select (V)" },
  { id: "text",    icon: <Type size={17} />,          label: "Text (T)" },
  { id: "rect",    icon: <Square size={17} />,        label: "Rectangle (R)" },
  { id: "circle",  icon: <Circle size={17} />,        label: "Ellipse (E)" },
  { id: "line",    icon: <Slash size={17} />,         label: "Line (L)" },
]

export default function ToolBar({ activeTool, onToolChange, onAddImage }: ToolBarProps) {
  return (
    <div className="w-12 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col items-center py-3 gap-1 flex-shrink-0">
      {tools.map((t) => (
        <button
          key={t.id}
          title={t.label}
          onClick={() => t.id === "image" ? onAddImage() : onToolChange(t.id as ActiveTool)}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
            activeTool === t.id
              ? "bg-[#FD8D6E]/20 text-[#FD8D6E]"
              : "text-[#555] hover:text-[#aaa] hover:bg-[#2a2a2a]"
          }`}
        >
          {t.icon}
        </button>
      ))}

      <div className="w-6 h-px bg-[#2a2a2a] my-1" />

      <button
        title="Upload image"
        onClick={onAddImage}
        className="w-9 h-9 rounded-lg flex items-center justify-center text-[#555] hover:text-[#aaa] hover:bg-[#2a2a2a] transition-all"
      >
        <ImagePlus size={17} />
      </button>
    </div>
  )
}
