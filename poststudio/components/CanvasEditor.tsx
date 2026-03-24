"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { X, AlignLeft, AlignCenter, AlignRight, ChevronUp, ChevronDown } from "lucide-react"
import { CODELESS_BRAND, PLATFORM_SIZES } from "@/lib/brand"
import { GeneratedPost } from "@/types"
import type { Canvas, FabricObject, FabricText, Rect } from "fabric"

interface CanvasEditorProps {
  post: GeneratedPost
  platform: "instagram" | "linkedin" | "facebook"
  onClose: () => void
}

interface LayerItem {
  type: string
  index: number
}

const platformBadgeColors: Record<string, { bg: string; text: string }> = {
  instagram: { bg: "bg-[#FD8D6E]/15", text: "text-[#FD8D6E]" },
  linkedin:  { bg: "bg-[#5A8DEE]/15", text: "text-[#5A8DEE]" },
  facebook:  { bg: "bg-blue-100",     text: "text-blue-600"  },
}

const brandSwatches = [
  CODELESS_BRAND.colors.coral,
  CODELESS_BRAND.colors.blue,
  CODELESS_BRAND.colors.offWhite,
  CODELESS_BRAND.colors.darkGray,
  CODELESS_BRAND.colors.softYellow,
  CODELESS_BRAND.colors.mintGreen,
]

export default function CanvasEditor({ post, platform, onClose }: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<Canvas | null>(null)
  const [layers, setLayers] = useState<LayerItem[]>([])
  const [selectedObj, setSelectedObj] = useState<FabricObject | null>(null)
  const [textContent, setTextContent] = useState("")
  const [fontSize, setFontSize] = useState(36)
  const [textColor, setTextColor] = useState(CODELESS_BRAND.colors.darkGray)
  const [fillColor, setFillColor] = useState(CODELESS_BRAND.colors.coral)
  const [opacity, setOpacity] = useState(100)
  const [cornerRadius, setCornerRadius] = useState(0)

  const platformSize = PLATFORM_SIZES[platform]
  const badgeColors = platformBadgeColors[platform]

  const updateLayers = useCallback(() => {
    if (!fabricRef.current) return
    const objects = fabricRef.current.getObjects()
    setLayers(objects.map((obj, i) => ({ type: obj.type ?? "object", index: i })))
  }, [])

  const syncSelectedState = useCallback((obj: FabricObject | null) => {
    setSelectedObj(obj)
    if (!obj) return
    const t = obj as FabricText
    if (obj.type === "text" || obj.type === "i-text" || obj.type === "textbox") {
      setTextContent(String(t.text ?? ""))
      setFontSize(typeof t.fontSize === "number" ? t.fontSize : 36)
      setTextColor(typeof obj.fill === "string" ? obj.fill : CODELESS_BRAND.colors.darkGray)
    }
    if (obj.type === "rect") {
      const r = obj as Rect
      setFillColor(typeof obj.fill === "string" ? obj.fill : CODELESS_BRAND.colors.coral)
      setCornerRadius(typeof r.rx === "number" ? r.rx : 0)
    }
    setOpacity(typeof obj.opacity === "number" ? Math.round(obj.opacity * 100) : 100)
  }, [])

  useEffect(() => {
    let canvas: Canvas | null = null
    let mounted = true

    async function initCanvas() {
      const { Canvas: FabricCanvas, FabricText: Txt, Rect: FabricRect, FabricImage: FImg } = await import("fabric")

      if (!canvasRef.current || !mounted) return

      canvas = new FabricCanvas(canvasRef.current, {
        width: platformSize.width,
        height: platformSize.height,
        backgroundColor: CODELESS_BRAND.colors.offWhite,
      })

      fabricRef.current = canvas

      canvas.on("object:added",    updateLayers)
      canvas.on("object:removed",  updateLayers)
      canvas.on("object:modified", updateLayers)
      canvas.on("selection:created", () => syncSelectedState((fabricRef.current?.getActiveObject() as FabricObject) ?? null))
      canvas.on("selection:updated", () => syncSelectedState((fabricRef.current?.getActiveObject() as FabricObject) ?? null))
      canvas.on("selection:cleared", () => setSelectedObj(null))

      if (post.imageUrl) {
        try {
          const img = await FImg.fromURL(post.imageUrl, { crossOrigin: "anonymous" })
          img.scaleToWidth(canvas.width)
          canvas.add(img as unknown as FabricObject)
          canvas.sendObjectToBack(img as unknown as FabricObject)
        } catch {
          // image load failed — continue without it
        }
      }

      const headline = new Txt(post.headline, {
        left: 40,
        top: 40,
        fontFamily: "Inter",
        fontSize: 36,
        fontWeight: "bold",
        fill: CODELESS_BRAND.colors.darkGray,
      } as ConstructorParameters<typeof Txt>[1])
      canvas.add(headline as unknown as FabricObject)

      const brandTag = new Txt("CodeLess", {
        left: platformSize.width - 120,
        top: platformSize.height - 40,
        fontFamily: "Space Mono",
        fontSize: 14,
        fill: CODELESS_BRAND.colors.coral,
      } as ConstructorParameters<typeof Txt>[1])
      canvas.add(brandTag as unknown as FabricObject)

      canvas.renderAll()
      updateLayers()
    }

    initCanvas()

    return () => {
      mounted = false
      if (canvas) {
        canvas.dispose()
        fabricRef.current = null
      }
    }
  }, [post, platformSize, updateLayers, syncSelectedState])

  async function addText() {
    if (!fabricRef.current) return
    const { FabricText: Txt } = await import("fabric")
    const text = new Txt("New Text", {
      left: 100,
      top: 100,
      fontFamily: "Inter",
      fontSize: 28,
      fill: CODELESS_BRAND.colors.darkGray,
    } as ConstructorParameters<typeof Txt>[1])
    fabricRef.current.add(text as unknown as FabricObject)
    fabricRef.current.renderAll()
  }

  async function addShape() {
    if (!fabricRef.current) return
    const { Rect: FabricRect } = await import("fabric")
    const rect = new FabricRect({
      left: 100,
      top: 200,
      width: 200,
      height: 100,
      fill: CODELESS_BRAND.colors.coral,
      rx: 8,
      ry: 8,
    })
    fabricRef.current.add(rect as unknown as FabricObject)
    fabricRef.current.renderAll()
  }

  async function addLogoTag() {
    if (!fabricRef.current) return
    const { FabricText: Txt } = await import("fabric")
    const tag = new Txt("CodeLess", {
      left: fabricRef.current.width - 120,
      top: fabricRef.current.height - 40,
      fontFamily: "Space Mono",
      fontSize: 14,
      fill: CODELESS_BRAND.colors.coral,
    } as ConstructorParameters<typeof Txt>[1])
    fabricRef.current.add(tag as unknown as FabricObject)
    fabricRef.current.renderAll()
  }

  function removeLayer(index: number) {
    if (!fabricRef.current) return
    const objects = fabricRef.current.getObjects()
    if (objects[index]) {
      fabricRef.current.remove(objects[index])
      fabricRef.current.renderAll()
    }
  }

  function setBackground(color: string) {
    if (!fabricRef.current) return
    fabricRef.current.backgroundColor = color
    fabricRef.current.renderAll()
  }

  function updateText(val: string) {
    setTextContent(val)
    if (selectedObj && (selectedObj.type === "text" || selectedObj.type === "i-text" || selectedObj.type === "textbox")) {
      (selectedObj as FabricText).set("text", val)
      fabricRef.current?.renderAll()
    }
  }

  function updateFontSize(val: number) {
    setFontSize(val)
    if (selectedObj) {
      (selectedObj as FabricText).set("fontSize", val)
      fabricRef.current?.renderAll()
    }
  }

  function updateTextColor(val: string) {
    setTextColor(val)
    if (selectedObj) {
      selectedObj.set("fill", val)
      fabricRef.current?.renderAll()
    }
  }

  function updateFillColor(val: string) {
    setFillColor(val)
    if (selectedObj) {
      selectedObj.set("fill", val)
      fabricRef.current?.renderAll()
    }
  }

  function updateOpacity(val: number) {
    setOpacity(val)
    if (selectedObj) {
      selectedObj.set("opacity", val / 100)
      fabricRef.current?.renderAll()
    }
  }

  function updateCornerRadius(val: number) {
    setCornerRadius(val)
    if (selectedObj) {
      const r = selectedObj as Rect
      r.set("rx", val)
      r.set("ry", val)
      fabricRef.current?.renderAll()
    }
  }

  function toggleBold() {
    if (!selectedObj) return
    const t = selectedObj as FabricText
    t.set("fontWeight", t.fontWeight === "bold" ? "normal" : "bold")
    fabricRef.current?.renderAll()
  }

  function toggleItalic() {
    if (!selectedObj) return
    const t = selectedObj as FabricText
    t.set("fontStyle", t.fontStyle === "italic" ? "normal" : "italic")
    fabricRef.current?.renderAll()
  }

  function setAlignment(align: string) {
    if (!selectedObj) return
    (selectedObj as FabricText).set("textAlign", align)
    fabricRef.current?.renderAll()
  }

  function bringForward() {
    if (!selectedObj || !fabricRef.current) return
    fabricRef.current.bringObjectForward(selectedObj)
    fabricRef.current.renderAll()
  }

  function sendBackward() {
    if (!selectedObj || !fabricRef.current) return
    fabricRef.current.sendObjectBackwards(selectedObj)
    fabricRef.current.renderAll()
  }

  function exportAs(format: "png" | "jpeg") {
    if (!fabricRef.current) return
    const dataUrl = fabricRef.current.toDataURL({
      format,
      quality: format === "jpeg" ? 0.92 : undefined,
      multiplier: 1,
    })
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = `codeless-post.${format === "jpeg" ? "jpg" : "png"}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const scale = Math.min(560 / platformSize.width, 480 / platformSize.height)
  const selectedType = selectedObj?.type ?? ""
  const isText = selectedType === "text" || selectedType === "i-text" || selectedType === "textbox"
  const isRect = selectedType === "rect"
  const isImage = selectedType === "image"
  const selText = selectedObj as FabricText | null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="w-[92vw] h-[90vh] bg-white rounded-2xl flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-12 border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0">
          <span className="font-[family-name:var(--font-inter)] font-semibold text-sm text-[#2E2E2E]">
            Canvas Editor
          </span>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${badgeColors.bg} ${badgeColors.text}`}>
            {PLATFORM_SIZES[platform].label}
          </span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* LEFT PANEL */}
          <aside className="w-[220px] bg-[#2E2E2E] text-white p-4 flex flex-col gap-4 overflow-y-auto flex-shrink-0">
            <p className="font-[family-name:var(--font-inter)] font-semibold text-[12px] uppercase tracking-widest"
               style={{ color: CODELESS_BRAND.colors.coral }}>
              Tools
            </p>

            <div className="flex flex-col gap-1.5">
              {[
                { label: "Add Text",     action: addText },
                { label: "Add Shape",    action: addShape },
                { label: "Add Logo Tag", action: addLogoTag },
              ].map(({ label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="w-full h-9 rounded-md text-sm font-[family-name:var(--font-inter)] font-medium bg-white/10 hover:bg-white/20 transition-colors text-left px-3"
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="border-t border-white/10" />

            <div className="flex flex-col gap-2">
              <p className="text-[11px] text-white/50">Background</p>
              <div className="grid grid-cols-3 gap-1.5">
                {brandSwatches.map((hex) => (
                  <button
                    key={hex}
                    onClick={() => setBackground(hex)}
                    className="w-8 h-8 rounded-md border-2 border-transparent hover:border-white transition-colors"
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
              </div>
            </div>

            <div className="border-t border-white/10" />

            <div className="flex flex-col gap-2">
              <p className="text-[11px] text-white/50">Layers</p>
              <div className="flex flex-col gap-0.5">
                {layers.map((layer, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-xs py-1 px-2 rounded hover:bg-white/10 cursor-pointer"
                  >
                    <span className="capitalize text-white/70">{layer.type}</span>
                    <button
                      onClick={() => removeLayer(layer.index)}
                      className="text-white/30 hover:text-white/70 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {layers.length === 0 && (
                  <p className="text-xs text-white/20 py-1">No objects</p>
                )}
              </div>
            </div>

            <div className="flex-1" />

            <p className="font-[family-name:var(--font-space-mono)] text-[10px] text-white/30">
              {platformSize.width} × {platformSize.height} · {PLATFORM_SIZES[platform].label}
            </p>
          </aside>

          {/* CENTER CANVAS */}
          <div className="flex-1 bg-[#E5E5E5] flex items-center justify-center overflow-hidden">
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                width: platformSize.width,
                height: platformSize.height,
              }}
              className="shadow-2xl"
            >
              <canvas ref={canvasRef} />
            </div>
          </div>

          {/* RIGHT PANEL */}
          <aside className="w-[220px] bg-[#F9F9F9] p-4 overflow-y-auto flex-shrink-0 flex flex-col gap-4">
            {!selectedObj && (
              <p className="text-sm text-gray-400 text-center mt-8">
                Select an element to edit
              </p>
            )}

            {isText && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-gray-500">Text Content</label>
                  <textarea
                    value={textContent}
                    onChange={(e) => updateText(e.target.value)}
                    className="text-sm border border-gray-200 rounded-md p-2 resize-none h-20 bg-white focus:outline-none focus:border-[#FD8D6E]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-gray-500">Font Size: {fontSize}px</label>
                  <input
                    type="range" min={10} max={80} step={1} value={fontSize}
                    onChange={(e) => updateFontSize(Number(e.target.value))}
                    className="w-full accent-[#FD8D6E]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-gray-500">Color</label>
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {brandSwatches.map((hex) => (
                      <button
                        key={hex}
                        onClick={() => updateTextColor(hex)}
                        className={`w-6 h-6 rounded border-2 transition-colors ${textColor === hex ? "border-gray-400" : "border-transparent"}`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                  <input
                    type="color" value={textColor}
                    onChange={(e) => updateTextColor(e.target.value)}
                    className="w-full h-8 rounded cursor-pointer border border-gray-200"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={toggleBold}
                    className={`flex-1 h-8 rounded text-sm font-bold border transition-colors ${selText?.fontWeight === "bold" ? "bg-[#2E2E2E] text-white border-[#2E2E2E]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
                  >B</button>
                  <button
                    onClick={toggleItalic}
                    className={`flex-1 h-8 rounded text-sm italic border transition-colors ${selText?.fontStyle === "italic" ? "bg-[#2E2E2E] text-white border-[#2E2E2E]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
                  >I</button>
                </div>

                <div className="flex gap-1">
                  {[
                    { align: "left",   Icon: AlignLeft },
                    { align: "center", Icon: AlignCenter },
                    { align: "right",  Icon: AlignRight },
                  ].map(({ align, Icon }) => (
                    <button
                      key={align}
                      onClick={() => setAlignment(align)}
                      className={`flex-1 h-8 rounded border flex items-center justify-center transition-colors ${selText?.textAlign === align ? "bg-[#2E2E2E] text-white border-[#2E2E2E]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
                    >
                      <Icon size={14} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isRect && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-gray-500">Fill Color</label>
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {brandSwatches.map((hex) => (
                      <button
                        key={hex}
                        onClick={() => updateFillColor(hex)}
                        className={`w-6 h-6 rounded border-2 transition-colors ${fillColor === hex ? "border-gray-400" : "border-transparent"}`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                  <input
                    type="color" value={fillColor}
                    onChange={(e) => updateFillColor(e.target.value)}
                    className="w-full h-8 rounded cursor-pointer border border-gray-200"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-gray-500">Opacity: {opacity}%</label>
                  <input
                    type="range" min={0} max={100} value={opacity}
                    onChange={(e) => updateOpacity(Number(e.target.value))}
                    className="w-full accent-[#FD8D6E]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-gray-500">Corner Radius: {cornerRadius}px</label>
                  <input
                    type="range" min={0} max={50} value={cornerRadius}
                    onChange={(e) => updateCornerRadius(Number(e.target.value))}
                    className="w-full accent-[#FD8D6E]"
                  />
                </div>
              </div>
            )}

            {isImage && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-gray-500">Opacity: {opacity}%</label>
                  <input
                    type="range" min={0} max={100} value={opacity}
                    onChange={(e) => updateOpacity(Number(e.target.value))}
                    className="w-full accent-[#FD8D6E]"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={bringForward}
                    className="flex-1 h-8 rounded border border-gray-200 text-xs text-gray-600 hover:border-gray-400 flex items-center justify-center gap-1 bg-white">
                    <ChevronUp size={12} /> Forward
                  </button>
                  <button onClick={sendBackward}
                    className="flex-1 h-8 rounded border border-gray-200 text-xs text-gray-600 hover:border-gray-400 flex items-center justify-center gap-1 bg-white">
                    <ChevronDown size={12} /> Back
                  </button>
                </div>
              </div>
            )}

            <div className="mt-auto flex flex-col gap-2">
              <div className="border-t border-gray-200 pt-3">
                <label className="text-[11px] text-gray-500 mb-2 block">Export</label>
                <button
                  onClick={() => exportAs("png")}
                  className="w-full h-9 rounded-md text-sm font-[family-name:var(--font-inter)] font-semibold bg-[#2E2E2E] text-white hover:opacity-90 transition-opacity mb-2"
                >
                  Export PNG
                </button>
                <button
                  onClick={() => exportAs("jpeg")}
                  className="w-full h-9 rounded-md text-sm font-[family-name:var(--font-inter)] font-semibold bg-[#FD8D6E] text-[#2E2E2E] hover:opacity-90 transition-opacity"
                >
                  Export JPG
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

