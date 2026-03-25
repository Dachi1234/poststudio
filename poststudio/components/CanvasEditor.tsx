"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  X, Undo2, Redo2, Download, Check,
  AlignStartVertical, AlignCenterHorizontal, AlignEndVertical,
  AlignStartHorizontal, AlignCenterVertical, AlignEndHorizontal,
  AlignHorizontalDistributeCenter, AlignVerticalDistributeCenter,
  Lock, Unlock, Group, Ungroup,
} from "lucide-react"
import { toast } from "sonner"
import { GeneratedPost } from "@/types"
import { preloadAllFonts, loadFont } from "./canvas/fonts"
import { getTemplateLayout, type TxtSpec, type ShapeSpec } from "./canvas/templateLayouts"
import ToolBar, { ActiveTool } from "./canvas/ToolBar"
import {
  TextPanel, ShapePanel, ImagePanel, CanvasPanel,
  LockStrip, PosSizeStrip,
  TextProps, ShapeProps, ImagePanelProps, CanvasPanelProps,
} from "./canvas/PropertiesPanel"
import LayersPanel, { Layer } from "./canvas/LayersPanel"

const CS = 1080

interface CanvasEditorProps {
  post:        GeneratedPost
  platform:    "instagram" | "linkedin" | "facebook"
  postDbId?:   string
  templateId?: string   // when opened from TemplateExporter
  colorTheme?: string   // when opened from TemplateExporter
  onClose:     () => void
}

function getLabelForObj(obj: any, idx: number): string {
  const t = obj?.type?.toLowerCase() ?? ""
  if (t === "i-text" || t === "textbox") return (obj.text ?? "Text").slice(0, 22)
  if (t === "rect")   return "Rectangle"
  if (t === "circle" || t === "ellipse") return "Ellipse"
  if (t === "image")  return "Image"
  if (t === "line")   return "Line"
  if (t === "group")  return "Group"
  return `Layer ${idx}`
}

export default function CanvasEditor({ post, platform, postDbId, templateId, colorTheme, onClose }: CanvasEditorProps) {
  /* refs */
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const fc          = useRef<any>(null)
  const fabricRef   = useRef<any>(null)   // fabric module — persists across rebuilds
  const ctrRef      = useRef<HTMLDivElement>(null)
  const histRef     = useRef<any[]>([])
  const histIdx     = useRef(-1)
  const skipHist    = useRef(false)
  const clipboard   = useRef<any>(null)
  const imageInput  = useRef<HTMLInputElement>(null)
  const bgImageInput = useRef<HTMLInputElement>(null)
  const addingRef   = useRef(false)
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastSavedRef = useRef<string>("")
  const bgImageObjRef = useRef<any>(null)  // fabric image used as bg
  const canvasReadyRef = useRef(false)     // true once fabric Canvas is created

  /* ui */
  const [scale,       setScale]       = useState(0.5)
  const [activeTool,  setActiveTool]  = useState<ActiveTool>("select")
  const [selType,     setSelType]     = useState<"text" | "shape" | "image" | "none">("none")
  const [layers,      setLayers]      = useState<Layer[]>([])
  const [selectedId,  setSelectedId]  = useState<string | null>(null)
  const [canUndo,     setCanUndo]     = useState(false)
  const [canRedo,     setCanRedo]     = useState(false)
  const [bgColor,     setBgColor]     = useState("#FFFFFF")
  const [exporting,   setExporting]   = useState(false)
  const [saveStatus,  setSaveStatus]  = useState<"saved" | "saving" | "unsaved">("saved")
  const [showGrid,    setShowGrid]    = useState(false)
  const [bgImageUrl,  setBgImageUrl]  = useState("")
  const [isLocked,    setIsLocked]    = useState(false)

  /* text */
  const [fontFamily,  setFontFamily]  = useState("Inter")
  const [fontSize,    setFontSize]    = useState(72)
  const [fontWeight,  setFontWeight]  = useState("400")
  const [textColor,   setTextColor]   = useState("#2E2E2E")
  const [textAlign,   setTextAlign]   = useState("left")
  const [italic,      setItalic]      = useState(false)
  const [underline,   setUnderline]   = useState(false)
  const [lineHeight,  setLineHeight]  = useState(1.2)
  const [charSpacing, setCharSpacing] = useState(0)

  /* shape */
  const [fillColor,    setFillColor]    = useState("#FD8D6E")
  const [strokeColor,  setStrokeColor]  = useState("")
  const [strokeWidth,  setStrokeWidth]  = useState(0)
  const [cornerRadius, setCornerRadius] = useState(0)
  const [opacity,      setOpacity]      = useState(100)
  const [isRect,       setIsRect]       = useState(false)

  /* image */
  const [imgOpacity,    setImgOpacity]    = useState(100)
  const [imgBrightness, setImgBrightness] = useState(0)
  const [imgContrast,   setImgContrast]   = useState(0)
  const [imgSaturation, setImgSaturation] = useState(0)
  const [imgBlur,       setImgBlur]       = useState(0)
  const [fillMode,      setFillMode]      = useState("cover")

  /* pos/size */
  const [objX, setObjX] = useState(0)
  const [objY, setObjY] = useState(0)
  const [objW, setObjW] = useState(100)
  const [objH, setObjH] = useState(100)

  /* ── history ────────────────────────────────────────────────── */

  const saveHistory = useCallback(() => {
    const canvas = fc.current
    if (!canvas || skipHist.current) return
    const json = canvas.toJSON(["id", "locked"])
    histRef.current = histRef.current.slice(0, histIdx.current + 1)
    histRef.current.push(json)
    if (histRef.current.length > 50) histRef.current.shift()
    histIdx.current = histRef.current.length - 1
    setCanUndo(histIdx.current > 0)
    setCanRedo(false)
    setSaveStatus("unsaved")
  }, [])

  const refreshLayers = useCallback(() => {
    const canvas = fc.current
    if (!canvas) return
    setLayers(canvas.getObjects().map((o: any, i: number) => ({
      id:      o.id ?? String(i),
      type:    o.type ?? "object",
      label:   getLabelForObj(o, i),
      locked:  o.locked ?? false,
      visible: o.visible !== false,
    })))
  }, [])

  const restoreFromHistory = useCallback(async (json: any) => {
    const canvas = fc.current
    if (!canvas) return
    skipHist.current = true
    await canvas.loadFromJSON(json)
    canvas.renderAll()
    skipHist.current = false
    refreshLayers()
  }, [refreshLayers])

  const undo = useCallback(async () => {
    if (histIdx.current <= 0) return
    histIdx.current--
    await restoreFromHistory(histRef.current[histIdx.current])
    setCanUndo(histIdx.current > 0)
    setCanRedo(true)
  }, [restoreFromHistory])

  const redo = useCallback(async () => {
    if (histIdx.current >= histRef.current.length - 1) return
    histIdx.current++
    await restoreFromHistory(histRef.current[histIdx.current])
    setCanUndo(true)
    setCanRedo(histIdx.current < histRef.current.length - 1)
  }, [restoreFromHistory])

  /* ── auto-save to DB ─────────────────────────────────────────── */

  const saveToDb = useCallback(async () => {
    if (!postDbId || !fc.current) return
    const canvas = fc.current
    const json = JSON.stringify(canvas.toJSON(["id", "locked"]))
    if (json === lastSavedRef.current) return   // nothing changed
    setSaveStatus("saving")
    try {
      const res = await fetch(`/api/posts/${postDbId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canvasState: JSON.parse(json) }),
      })
      if (res.ok) {
        lastSavedRef.current = json
        setSaveStatus("saved")
      } else {
        setSaveStatus("unsaved")
      }
    } catch {
      setSaveStatus("unsaved")
    }
  }, [postDbId])

  /* ── sync panel from selected object ────────────────────────── */

  const syncPanelFromObj = useCallback((obj: any) => {
    if (!obj) {
      setSelType("none"); setSelectedId(null); setIsLocked(false)
      return
    }
    const t = obj.type?.toLowerCase() ?? ""
    setSelectedId(obj.id ?? null)
    setIsLocked(obj.locked ?? false)

    // position/size
    const bw = obj.width  * (obj.scaleX ?? 1)
    const bh = obj.height * (obj.scaleY ?? 1)
    setObjX(Math.round(obj.left ?? 0))
    setObjY(Math.round(obj.top  ?? 0))
    setObjW(Math.round(bw))
    setObjH(Math.round(bh))

    if (t === "i-text" || t === "textbox") {
      setSelType("text")
      setFontFamily(obj.fontFamily ?? "Inter")
      setFontSize(Math.round(obj.fontSize ?? 72))
      setFontWeight(String(obj.fontWeight ?? "400"))
      setTextColor(obj.fill ?? "#2E2E2E")
      setTextAlign(obj.textAlign ?? "left")
      setItalic(obj.fontStyle === "italic")
      setUnderline(obj.underline ?? false)
      setLineHeight(obj.lineHeight ?? 1.2)
      setCharSpacing(obj.charSpacing ?? 0)
    } else if (t === "image") {
      setSelType("image")
      setImgOpacity(Math.round((obj.opacity ?? 1) * 100))
      const filters = obj.filters ?? []
      const bright = filters.find((f: any) => f.type === "Brightness")
      const cont   = filters.find((f: any) => f.type === "Contrast")
      const sat    = filters.find((f: any) => f.type === "Saturation")
      const blur   = filters.find((f: any) => f.type === "Blur")
      setImgBrightness(bright ? Math.round(bright.brightness * 100) : 0)
      setImgContrast(cont     ? Math.round(cont.contrast * 100)     : 0)
      setImgSaturation(sat    ? Math.round(sat.saturation * 100)    : 0)
      setImgBlur(blur         ? Math.round(blur.blur * 20)          : 0)
    } else {
      setSelType("shape")
      setFillColor(obj.fill ?? "#FD8D6E")
      setStrokeColor(obj.stroke ?? "")
      setStrokeWidth(obj.strokeWidth ?? 0)
      setCornerRadius(obj.rx ?? 0)
      setOpacity(Math.round((obj.opacity ?? 1) * 100))
      setIsRect(t === "rect")
    }
  }, [])

  /* ── apply text props ────────────────────────────────────────── */

  const applyTextProp = useCallback((key: string, value: any) => {
    const canvas = fc.current
    const obj = canvas?.getActiveObject()
    if (!obj) return
    obj.set(key, value)
    canvas.renderAll()
  }, [])

  useEffect(() => { applyTextProp("fontFamily", fontFamily) }, [fontFamily])  // eslint-disable-line
  useEffect(() => { applyTextProp("fontSize",   fontSize)   }, [fontSize])    // eslint-disable-line
  useEffect(() => { applyTextProp("fontWeight", fontWeight) }, [fontWeight])  // eslint-disable-line
  useEffect(() => { applyTextProp("fill",       textColor)  }, [textColor])   // eslint-disable-line
  useEffect(() => { applyTextProp("textAlign",  textAlign)  }, [textAlign])   // eslint-disable-line
  useEffect(() => { applyTextProp("fontStyle",  italic ? "italic" : "normal") }, [italic])   // eslint-disable-line
  useEffect(() => { applyTextProp("underline",  underline)  }, [underline])   // eslint-disable-line
  useEffect(() => { applyTextProp("lineHeight", lineHeight)  }, [lineHeight])  // eslint-disable-line
  useEffect(() => { applyTextProp("charSpacing", charSpacing) }, [charSpacing]) // eslint-disable-line
  useEffect(() => { loadFont(fontFamily) }, [fontFamily])

  /* ── apply shape props ───────────────────────────────────────── */

  const applyShapeProp = useCallback((key: string, value: any) => {
    const canvas = fc.current
    const obj = canvas?.getActiveObject()
    if (!obj) return
    if (key === "rx") { obj.set("rx", value); obj.set("ry", value) }
    else obj.set(key, value)
    canvas.renderAll()
  }, [])

  useEffect(() => { applyShapeProp("fill",        fillColor)            }, [fillColor])    // eslint-disable-line
  useEffect(() => { applyShapeProp("stroke",       strokeColor || null) }, [strokeColor])  // eslint-disable-line
  useEffect(() => { applyShapeProp("strokeWidth",  strokeWidth)         }, [strokeWidth])  // eslint-disable-line
  useEffect(() => { applyShapeProp("rx",           cornerRadius)        }, [cornerRadius]) // eslint-disable-line
  useEffect(() => { applyShapeProp("opacity",      opacity / 100)       }, [opacity])      // eslint-disable-line

  /* ── apply image filters ─────────────────────────────────────── */

  const applyImageFilters = useCallback((
    brightness: number, contrast: number, saturation: number, blur: number, opa: number
  ) => {
    const canvas = fc.current
    const obj = canvas?.getActiveObject()
    if (!obj || obj.type !== "image") return
    const { Brightness, Contrast, Saturation, Blur } = (window as any).__fabricFilters__ ?? {}
    if (!Brightness) return
    obj.filters = [
      new Brightness({ brightness: brightness / 100 }),
      new Contrast({ contrast: contrast / 100 }),
      new Saturation({ saturation: saturation / 100 }),
      ...(blur > 0 ? [new Blur({ blur: blur / 20 })] : []),
    ]
    obj.applyFilters()
    obj.set("opacity", opa / 100)
    canvas.renderAll()
  }, [])

  useEffect(() => {
    applyImageFilters(imgBrightness, imgContrast, imgSaturation, imgBlur, imgOpacity)
  }, [imgBrightness, imgContrast, imgSaturation, imgBlur, imgOpacity, applyImageFilters])

  /* ── image fill mode ─────────────────────────────────────────── */

  useEffect(() => {
    const canvas = fc.current
    const obj = canvas?.getActiveObject()
    if (!obj || obj.type !== "image") return
    applyFillMode(obj, fillMode)
    canvas.renderAll()
    saveHistory()
  }, [fillMode]) // eslint-disable-line

  function applyFillMode(obj: any, mode: string) {
    const iw = obj.width, ih = obj.height
    if (!iw || !ih) return
    let sx = 1, sy = 1
    if (mode === "cover") {
      const s = Math.max(CS / iw, CS / ih)
      sx = s; sy = s
    } else if (mode === "fit") {
      const s = Math.min(CS / iw, CS / ih)
      sx = s; sy = s
    } else if (mode === "stretch") {
      sx = CS / iw; sy = CS / ih
    } else {
      sx = 1; sy = 1
    }
    obj.set({ scaleX: sx, scaleY: sy, left: CS / 2 - (iw * sx) / 2, top: CS / 2 - (ih * sy) / 2 })
    obj.setCoords()
  }

  /* ── background color ────────────────────────────────────────── */

  useEffect(() => {
    const canvas = fc.current
    if (!canvas) return
    canvas.backgroundColor = bgColor
    canvas.renderAll()
  }, [bgColor])

  /* ── grid overlay (CSS) ──────────────────────────────────────── */
  // Grid is done via CSS background on the wrapper div (no Fabric objects)

  /* ── position/size apply ─────────────────────────────────────── */

  const applyPosSizeToObj = useCallback((key: "left"|"top"|"w"|"h", val: number) => {
    const canvas = fc.current
    const obj = canvas?.getActiveObject()
    if (!obj) return
    if (key === "left") obj.set("left", val)
    if (key === "top")  obj.set("top",  val)
    if (key === "w") {
      const currentW = obj.width * (obj.scaleX ?? 1)
      if (currentW > 0) obj.set("scaleX", val / obj.width)
    }
    if (key === "h") {
      const currentH = obj.height * (obj.scaleY ?? 1)
      if (currentH > 0) obj.set("scaleY", val / obj.height)
    }
    obj.setCoords()
    canvas.renderAll()
    saveHistory()
  }, [saveHistory])

  /* ── lock/unlock ─────────────────────────────────────────────── */

  const toggleLockSelected = useCallback(() => {
    const canvas = fc.current
    const obj = canvas?.getActiveObject()
    if (!obj) return
    const locked = !obj.locked
    obj.set({
      locked,
      selectable:    !locked,
      evented:       !locked,
      lockMovementX: locked, lockMovementY: locked,
      lockScalingX:  locked, lockScalingY:  locked,
      lockRotation:  locked,
    })
    canvas.renderAll()
    setIsLocked(locked)
    refreshLayers()
    saveHistory()
  }, [refreshLayers, saveHistory])

  /* ── alignment ───────────────────────────────────────────────── */

  const alignTo = useCallback((alignment: string) => {
    const canvas = fc.current
    if (!canvas) return
    const active = canvas.getActiveObject()
    if (!active) return

    const objects: any[] = active.type === "activeselection"
      ? active.getObjects()
      : [active]

    objects.forEach((obj: any) => {
      const bw = obj.width  * (obj.scaleX ?? 1)
      const bh = obj.height * (obj.scaleY ?? 1)
      if (alignment === "left")    obj.set("left", 0)
      if (alignment === "centerH") obj.set("left", (CS - bw) / 2)
      if (alignment === "right")   obj.set("left", CS - bw)
      if (alignment === "top")     obj.set("top",  0)
      if (alignment === "centerV") obj.set("top",  (CS - bh) / 2)
      if (alignment === "bottom")  obj.set("top",  CS - bh)
      obj.setCoords()
    })
    canvas.renderAll()
    saveHistory()
  }, [saveHistory])

  const distributeH = useCallback(() => {
    const canvas = fc.current
    const active = canvas?.getActiveObject()
    if (!active || active.type !== "activeselection") return
    const objs = [...active.getObjects()].sort((a: any, b: any) => (a.left ?? 0) - (b.left ?? 0))
    if (objs.length < 3) return
    const first = objs[0], last = objs[objs.length - 1]
    const totalW = objs.reduce((s: number, o: any) => s + o.width * (o.scaleX ?? 1), 0)
    const gap = ((last.left ?? 0) - (first.left ?? 0) + last.width * (last.scaleX ?? 1) - totalW) / (objs.length - 1)
    let x = first.left ?? 0
    objs.forEach((o: any) => { o.set("left", x); x += o.width * (o.scaleX ?? 1) + gap; o.setCoords() })
    canvas.renderAll(); saveHistory()
  }, [saveHistory])

  const distributeV = useCallback(() => {
    const canvas = fc.current
    const active = canvas?.getActiveObject()
    if (!active || active.type !== "activeselection") return
    const objs = [...active.getObjects()].sort((a: any, b: any) => (a.top ?? 0) - (b.top ?? 0))
    if (objs.length < 3) return
    const first = objs[0], last = objs[objs.length - 1]
    const totalH = objs.reduce((s: number, o: any) => s + o.height * (o.scaleY ?? 1), 0)
    const gap = ((last.top ?? 0) - (first.top ?? 0) + last.height * (last.scaleY ?? 1) - totalH) / (objs.length - 1)
    let y = first.top ?? 0
    objs.forEach((o: any) => { o.set("top", y); y += o.height * (o.scaleY ?? 1) + gap; o.setCoords() })
    canvas.renderAll(); saveHistory()
  }, [saveHistory])

  /* ── canvas size ResizeObserver ──────────────────────────────── */

  useEffect(() => {
    const el = ctrRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      const s = Math.min(width / CS, height / CS) * 0.92
      setScale(s)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /* ── canvas creation (runs once) ─────────────────────────────── */

  useEffect(() => {
    if (!canvasElRef.current) return
    let disposed = false

    async function createCanvas() {
      preloadAllFonts()
      const fabric = await import("fabric")
      fabricRef.current = fabric
      const { Canvas, filters } = fabric as any
      const { Brightness, Contrast, Saturation, Blur } = filters ?? {}
      ;(window as any).__fabricFilters__ = { Brightness, Contrast, Saturation, Blur }

      if (disposed || !canvasElRef.current) return

      const canvas = new Canvas(canvasElRef.current, {
        width: CS, height: CS,
        backgroundColor: "#FFFFFF",
        preserveObjectStacking: true,
        stopContextMenu: true,
      })
      fc.current = canvas

      /* events */
      const handleSelect = (e: any) => {
        const obj = e.selected?.[0] ?? canvas.getActiveObject()
        syncPanelFromObj(obj)
      }
      canvas.on("selection:created", handleSelect)
      canvas.on("selection:updated", handleSelect)
      canvas.on("selection:cleared", () => { syncPanelFromObj(null) })
      canvas.on("object:modified",   () => { refreshLayers(); saveHistory() })
      canvas.on("object:added",      () => { refreshLayers() })
      canvas.on("object:removed",    () => { refreshLayers(); saveHistory() })
      canvas.on("text:changed",      () => { refreshLayers(); saveHistory() })

      canvas.on("mouse:down", async (e: any) => {
        const tool = (window as any).__activeTool__ ?? "select"
        if (tool === "select" || addingRef.current) return
        addingRef.current = true
        const ptr = canvas.getViewportPoint(e.e)
        await addObjectAtPoint(canvas, fabricRef.current, tool, ptr.x, ptr.y)
        ;(window as any).__activeTool__ = "select"
        setActiveTool("select")
        setTimeout(() => { addingRef.current = false }, 300)
      })

      canvasReadyRef.current = true
    }

    createCanvas()

    return () => {
      disposed = true
      canvasReadyRef.current = false
      if (autoSaveRef.current) clearInterval(autoSaveRef.current)
      fc.current?.dispose()
      fc.current = null
      fabricRef.current = null
    }
  }, []) // eslint-disable-line

  /* ── build / rebuild template content ──────────────────────────
     Runs on mount AND whenever templateId or colorTheme changes.
     Waits for canvas to be ready, then clears all objects and
     rebuilds from scratch.
  ─────────────────────────────────────────────────────────────── */

  useEffect(() => {
    let disposed = false
    let attempts = 0

    async function buildContent() {
      // Wait for the canvas creation effect to finish
      while (!canvasReadyRef.current && attempts < 50) {
        await new Promise(r => setTimeout(r, 60))
        attempts++
      }
      const canvas = fc.current
      const fabric = fabricRef.current
      if (!canvas || !fabric || disposed) return

      const { Textbox, Rect, Circle, Line, FabricImage } = fabric as any

      // ── CLEAR everything from any previous template ──
      canvas.discardActiveObject()
      const allObjs = canvas.getObjects().slice()
      for (const obj of allObjs) canvas.remove(obj)
      canvas.backgroundColor = "#FFFFFF"
      bgImageObjRef.current = null

      skipHist.current = true
      histRef.current = []
      histIdx.current = -1
      setCanUndo(false)
      setCanRedo(false)

      /* Try to load saved canvas state from DB.
         Skip when opened from a template — always start fresh. */
      let loadedFromDb = false
      if (postDbId && !templateId) {
        try {
          const res = await fetch(`/api/posts/${postDbId}`)
          if (res.ok) {
            const { post: dbPost } = await res.json()
            if (dbPost?.canvasState) {
              await canvas.loadFromJSON(dbPost.canvasState)
              canvas.renderAll()
              loadedFromDb = true
              setBgColor(canvas.backgroundColor ?? "#FFFFFF")
            }
          }
        } catch { /* fall through to auto-populate */ }
      }

      /* ── Populate canvas from template layout ── */
      if (!loadedFromDb) {
        const mkText = (text: string, opts: any) =>
          new Textbox(text, { id: crypto.randomUUID(), ...opts })

        const addLockedShape = (spec: ShapeSpec) => {
          const base = { id: crypto.randomUUID(), selectable: false, evented: false, locked: true }
          if (spec.type === "rect") {
            canvas.add(new Rect({ ...base, left: spec.left, top: spec.top,
              width: spec.width, height: spec.height, fill: spec.fill,
              rx: spec.rx ?? 0, ry: spec.ry ?? 0,
              opacity: spec.opacity ?? 1, angle: spec.angle ?? 0,
              ...(spec.originX ? { originX: spec.originX } : {}),
              ...(spec.originY ? { originY: spec.originY } : {}),
            }))
          } else if (spec.type === "circle") {
            canvas.add(new Circle({ ...base, left: spec.left, top: spec.top,
              radius: spec.radius, fill: spec.fill, opacity: spec.opacity ?? 1,
              stroke: spec.stroke ?? "", strokeWidth: spec.strokeWidth ?? 0,
              originX: "center", originY: "center",
            }))
          } else if (spec.type === "line") {
            canvas.add(new Line(spec.points, { ...base,
              stroke: spec.stroke, strokeWidth: spec.strokeWidth,
              opacity: spec.opacity ?? 1,
            }))
          }
        }

        const lay = getTemplateLayout(
          templateId, colorTheme,
          post.headline ?? "", post.caption ?? "",
          !!post.imageUrl,
        )

        canvas.backgroundColor = lay.bg
        setBgColor(lay.bg)

        for (const shape of lay.shapes) {
          addLockedShape(shape)
        }

        /* Background image */
        if (post.imageUrl) {
          try {
            const img = await FabricImage.fromURL(post.imageUrl, { crossOrigin: "anonymous" })
            if (!disposed) {
              const sc = Math.max(CS / img.width!, CS / img.height!)
              img.set({
                id: crypto.randomUUID(), scaleX: sc, scaleY: sc,
                originX: "center", originY: "center",
                left: CS / 2, top: CS / 2,
              })
              canvas.add(img)
              canvas.sendObjectToBack(img)
            }
          } catch {}
        }

        /* Dark overlay when no template but image is present */
        if (post.imageUrl && !templateId) {
          canvas.add(new Rect({
            id: crypto.randomUUID(), width: CS, height: CS, left: 0, top: 0,
            fill: "rgba(0,0,0,0.42)", selectable: true,
          }))
        }

        /* Text elements */
        const capFull = (post.caption ?? "").slice(0, 180)
        const getPostField = (field: TxtSpec["field"], spec: TxtSpec): string => {
          if (spec.text) return spec.text
          if (field === "headline") return post.headline ?? ""
          if (field === "caption")  return capFull
          if (field === "cta")      return post.cta ?? ""
          if (field === "hashtags") return (post.hashtags ?? []).slice(0, 5).join("  ")
          return ""
        }

        for (const spec of lay.elements) {
          const text = getPostField(spec.field, spec)
          if (!text) continue
          canvas.add(mkText(text, {
            left: spec.left, top: spec.top, width: spec.width,
            fontFamily: spec.fontFamily ?? "Inter",
            fontSize: spec.fontSize,
            fontWeight: spec.weight ?? "400",
            textAlign: spec.align ?? "left",
            fill: spec.fill,
            opacity: spec.opacity ?? 1,
            lineHeight: spec.lineHeight ?? 1.2,
            charSpacing: spec.charSpacing ?? 0,
          }))
        }
      }

      canvas.renderAll()
      skipHist.current = false
      refreshLayers()
      saveHistory()
    }

    buildContent()

    return () => { disposed = true }
  }, [templateId, colorTheme]) // eslint-disable-line

  /* ── auto-save interval ──────────────────────────────────────── */

  useEffect(() => {
    if (!postDbId) return
    autoSaveRef.current = setInterval(() => { saveToDb() }, 30_000)
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current) }
  }, [postDbId, saveToDb])

  /* ── keep activeTool in window ───────────────────────────────── */

  useEffect(() => {
    ;(window as any).__activeTool__ = activeTool
    const canvas = fc.current
    if (!canvas) return
    canvas.defaultCursor = activeTool === "select" ? "default" : "crosshair"
    canvas.selection = activeTool === "select"
  }, [activeTool])

  /* ── keyboard shortcuts ──────────────────────────────────────── */

  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      const canvas = fc.current
      if (!canvas) return
      const tag = (e.target as HTMLElement)?.tagName
      const isEditingText = canvas.getActiveObject()?.isEditing
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
      if (isEditingText && !((e.ctrlKey || e.metaKey) && ["z","y","s"].includes(e.key))) return

      const meta = e.ctrlKey || e.metaKey

      if (meta && e.key === "z" && !e.shiftKey) { e.preventDefault(); await undo(); return }
      if (meta && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); await redo(); return }
      if (meta && e.key === "s") { e.preventDefault(); saveToDb(); toast.success("Saved!"); return }

      if ((e.key === "Delete" || e.key === "Backspace") && !isEditingText) {
        e.preventDefault()
        const active = canvas.getActiveObjects()
        if (active.length) { canvas.remove(...active); canvas.discardActiveObject(); canvas.renderAll(); saveHistory() }
        return
      }

      /* Ctrl+A select all */
      if (meta && e.key === "a") {
        e.preventDefault()
        const objs = canvas.getObjects()
        if (!objs.length) return
        const fabricMod = await import("fabric") as any
        const sel = new fabricMod.ActiveSelection(objs, { canvas })
        canvas.setActiveObject(sel); canvas.renderAll()
        return
      }

      /* Copy / Paste / Duplicate */
      if (meta && e.key === "c") {
        e.preventDefault()
        const obj = canvas.getActiveObject()
        if (obj) clipboard.current = await obj.clone()
        return
      }
      if (meta && e.key === "v") {
        e.preventDefault()
        if (!clipboard.current) return
        const cloned = await clipboard.current.clone()
        cloned.set({ left: (cloned.left ?? 0) + 20, top: (cloned.top ?? 0) + 20, id: crypto.randomUUID() })
        canvas.add(cloned); canvas.setActiveObject(cloned); canvas.renderAll(); saveHistory()
        return
      }
      if (meta && e.key === "d") {
        e.preventDefault()
        const obj = canvas.getActiveObject()
        if (!obj) return
        const cloned = await obj.clone()
        cloned.set({ left: (cloned.left ?? 0) + 20, top: (cloned.top ?? 0) + 20, id: crypto.randomUUID() })
        canvas.add(cloned); canvas.setActiveObject(cloned); canvas.renderAll(); saveHistory()
        return
      }

      /* Group / Ungroup */
      if (meta && e.key === "g") {
        e.preventDefault()
        const fabricMod = await import("fabric") as any
        const active = canvas.getActiveObject()
        if (!active) return
        if (active.type === "activeselection") {
          const grp = new fabricMod.Group(active.getObjects(), { id: crypto.randomUUID() })
          active.getObjects().forEach((o: any) => canvas.remove(o))
          canvas.discardActiveObject()
          canvas.add(grp); canvas.setActiveObject(grp); canvas.renderAll(); saveHistory()
        } else if (active.type === "group") {
          const items = active.getObjects()
          canvas.remove(active)
          items.forEach((item: any) => { item.set("id", crypto.randomUUID()); canvas.add(item) })
          canvas.discardActiveObject(); canvas.renderAll(); saveHistory()
        }
        return
      }

      /* Lock / Unlock */
      if (meta && e.key === "l") { e.preventDefault(); toggleLockSelected(); return }

      /* Arrow nudge */
      const obj = canvas.getActiveObject()
      if (!obj) {
        if (!meta) {
          if (e.key === "v") setActiveTool("select")
          if (e.key === "t") setActiveTool("text")
          if (e.key === "r") setActiveTool("rect")
          if (e.key === "e") setActiveTool("circle")
          if (e.key === "l") setActiveTool("line")
        }
        return
      }
      const step = e.shiftKey ? 10 : 1
      if (e.key === "ArrowLeft")  { e.preventDefault(); obj.set("left", (obj.left ?? 0) - step) }
      if (e.key === "ArrowRight") { e.preventDefault(); obj.set("left", (obj.left ?? 0) + step) }
      if (e.key === "ArrowUp")    { e.preventDefault(); obj.set("top",  (obj.top  ?? 0) - step) }
      if (e.key === "ArrowDown")  { e.preventDefault(); obj.set("top",  (obj.top  ?? 0) + step) }
      if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)) { canvas.renderAll(); saveHistory() }
      if (e.key === "Escape") { canvas.discardActiveObject(); canvas.renderAll() }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [undo, redo, saveHistory, saveToDb, toggleLockSelected])

  /* ── add object at point ─────────────────────────────────────── */

  async function addObjectAtPoint(canvas: any, fabric: any, tool: string, x: number, y: number) {
    const { Textbox, Rect, Circle, Line } = fabric as any
    let obj: any
    if (tool === "text") {
      loadFont("Inter")
      obj = new Textbox("Double-click to edit", {
        left: x - 150, top: y - 30, width: 300,
        fontFamily: "Inter", fontSize: 48, fill: "#2E2E2E", textAlign: "center",
        id: crypto.randomUUID(),
      })
    } else if (tool === "rect") {
      obj = new Rect({ left: x - 100, top: y - 60, width: 200, height: 120, fill: "#FD8D6E", id: crypto.randomUUID() })
    } else if (tool === "circle") {
      obj = new Circle({ left: x - 60, top: y - 60, radius: 60, fill: "#5A8DEE", id: crypto.randomUUID() })
    } else if (tool === "line") {
      obj = new Line([x - 100, y, x + 100, y], { stroke: "#2E2E2E", strokeWidth: 4, id: crypto.randomUUID() })
    }
    if (obj) {
      canvas.add(obj); canvas.setActiveObject(obj); canvas.renderAll()
      saveHistory(); syncPanelFromObj(obj)
    }
  }

  /* ── image upload ────────────────────────────────────────────── */

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const fabric = await import("fabric") as any
    try {
      const img = await fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" })
      const sc = Math.min(CS / img.width!, CS / img.height!, 1) * 0.8
      img.set({ id: crypto.randomUUID(), scaleX: sc, scaleY: sc,
        left: CS / 2 - (img.width! * sc) / 2, top: CS / 2 - (img.height! * sc) / 2 })
      fc.current?.add(img); fc.current?.setActiveObject(img); fc.current?.renderAll(); saveHistory()
    } catch { toast.error("Failed to load image") }
    if (imageInput.current) imageInput.current.value = ""
  }

  /* ── bg image upload ─────────────────────────────────────────── */

  const handleBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const fabric = await import("fabric") as any
    try {
      const img = await fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" })
      const sc = Math.max(CS / img.width!, CS / img.height!)
      img.set({ id: crypto.randomUUID(), scaleX: sc, scaleY: sc,
        left: CS / 2 - (img.width! * sc) / 2, top: CS / 2 - (img.height! * sc) / 2,
        locked: true, selectable: false, evented: false })
      if (bgImageObjRef.current) fc.current?.remove(bgImageObjRef.current)
      bgImageObjRef.current = img
      fc.current?.add(img)
      fc.current?.sendObjectToBack(img)
      fc.current?.renderAll()
      setBgImageUrl(url)
      saveHistory()
    } catch { toast.error("Failed to load background image") }
    if (bgImageInput.current) bgImageInput.current.value = ""
  }

  const clearBgImage = useCallback(() => {
    if (bgImageObjRef.current) {
      fc.current?.remove(bgImageObjRef.current)
      fc.current?.renderAll()
      bgImageObjRef.current = null
      setBgImageUrl("")
      saveHistory()
    }
  }, [saveHistory])

  /* ── flip ────────────────────────────────────────────────────── */

  const flipH = useCallback(() => {
    const canvas = fc.current; const obj = canvas?.getActiveObject()
    if (!obj) return; obj.set("flipX", !obj.flipX); canvas.renderAll(); saveHistory()
  }, [saveHistory])

  const flipV = useCallback(() => {
    const canvas = fc.current; const obj = canvas?.getActiveObject()
    if (!obj) return; obj.set("flipY", !obj.flipY); canvas.renderAll(); saveHistory()
  }, [saveHistory])

  /* ── export ──────────────────────────────────────────────────── */

  const exportCanvas = useCallback(async (format: "png" | "jpeg") => {
    const canvas = fc.current
    if (!canvas) return
    setExporting(true)
    try {
      canvas.discardActiveObject(); canvas.renderAll()
      await new Promise<void>(r => setTimeout(r, 100))
      const dataUrl = canvas.toDataURL({ format, quality: 0.95, multiplier: 1 })
      const link = document.createElement("a")
      link.href = dataUrl; link.download = `poststudio-${platform}-${Date.now()}.${format}`; link.click()
      toast.success("Downloaded!")
      await saveToDb()
    } catch { toast.error("Export failed") }
    setExporting(false)
  }, [platform, saveToDb])

  /* ── layer ops ───────────────────────────────────────────────── */

  const getObjById = useCallback((id: string) =>
    fc.current?.getObjects().find((o: any) => o.id === id) ?? null, [])

  const selectById = useCallback((id: string) => {
    const obj = getObjById(id); if (!obj) return
    fc.current?.setActiveObject(obj); fc.current?.renderAll(); syncPanelFromObj(obj); setSelectedId(id)
  }, [getObjById, syncPanelFromObj])

  const moveObjUp = useCallback((id: string) => {
    const obj = getObjById(id); if (!obj) return
    fc.current?.bringObjectForward(obj); refreshLayers(); saveHistory()
  }, [getObjById, refreshLayers, saveHistory])

  const moveObjDown = useCallback((id: string) => {
    const obj = getObjById(id); if (!obj) return
    fc.current?.sendObjectBackwards(obj); refreshLayers(); saveHistory()
  }, [getObjById, refreshLayers, saveHistory])

  const deleteById = useCallback((id: string) => {
    const obj = getObjById(id); if (!obj) return
    fc.current?.remove(obj); fc.current?.renderAll(); refreshLayers(); saveHistory()
  }, [getObjById, refreshLayers, saveHistory])

  const toggleLayerLock = useCallback((id: string) => {
    const obj = getObjById(id); if (!obj) return
    const locked = !obj.locked
    obj.set({ locked, selectable: !locked, evented: !locked,
      lockMovementX: locked, lockMovementY: locked,
      lockScalingX: locked, lockScalingY: locked, lockRotation: locked })
    fc.current?.renderAll(); refreshLayers()
  }, [getObjById, refreshLayers])

  const toggleLayerVisible = useCallback((id: string) => {
    const obj = getObjById(id); if (!obj) return
    obj.set("visible", !obj.visible); fc.current?.renderAll(); refreshLayers()
  }, [getObjById, refreshLayers])

  /* ── render ──────────────────────────────────────────────────── */

  const platColor: Record<string, string> = {
    instagram: "text-[#FD8D6E]", linkedin: "text-[#5A8DEE]", facebook: "text-blue-400",
  }

  const textPanelProps: TextProps = {
    fontFamily, setFontFamily, fontSize, setFontSize, fontWeight, setFontWeight,
    textColor, setTextColor, textAlign, setTextAlign, italic, setItalic,
    underline, setUnderline, lineHeight, setLineHeight, charSpacing, setCharSpacing,
  }
  const shapePanelProps: ShapeProps = {
    fillColor, setFillColor, strokeColor, setStrokeColor, strokeWidth, setStrokeWidth,
    cornerRadius, setCornerRadius, opacity, setOpacity, isRect,
  }
  const imgPanelProps: ImagePanelProps = {
    opacity: imgOpacity, setOpacity: setImgOpacity,
    brightness: imgBrightness, setBrightness: setImgBrightness,
    contrast: imgContrast, setContrast: setImgContrast,
    saturation: imgSaturation, setSaturation: setImgSaturation,
    blur: imgBlur, setBlur: setImgBlur,
    fillMode, setFillMode,
    onFlipH: flipH, onFlipV: flipV,
  }
  const canvasPanelProps: CanvasPanelProps = {
    bgColor, setBgColor,
    bgImageUrl, onBgImageUpload: () => bgImageInput.current?.click(), onBgImageClear: clearBgImage,
    showGrid, setShowGrid,
  }

  const gridStyle = showGrid ? {
    backgroundImage: `linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`,
    backgroundSize: `${40 * scale}px ${40 * scale}px`,
  } : {}

  const alignButtons = [
    { icon: <AlignStartVertical    size={13}/>, label: "Align left",            action: () => alignTo("left")    },
    { icon: <AlignCenterHorizontal size={13}/>, label: "Center horizontally",   action: () => alignTo("centerH") },
    { icon: <AlignEndVertical      size={13}/>, label: "Align right",           action: () => alignTo("right")   },
    { icon: <AlignStartHorizontal  size={13}/>, label: "Align top",             action: () => alignTo("top")     },
    { icon: <AlignCenterVertical   size={13}/>, label: "Center vertically",     action: () => alignTo("centerV") },
    { icon: <AlignEndHorizontal    size={13}/>, label: "Align bottom",          action: () => alignTo("bottom")  },
    { icon: <AlignHorizontalDistributeCenter size={13}/>, label: "Distribute H", action: distributeH },
    { icon: <AlignVerticalDistributeCenter   size={13}/>, label: "Distribute V", action: distributeV },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0d0d] flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="h-12 flex items-center justify-between px-3 border-b border-[#1e1e1e] flex-shrink-0 bg-[#111]">
        <div className="flex items-center gap-2">
          <button onClick={() => { saveToDb(); onClose() }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#555] hover:text-white hover:bg-[#2a2a2a] transition-all">
            <X size={16} />
          </button>
          <span className="text-white text-sm font-semibold tracking-wide">Canvas</span>
          <span className={`text-xs font-medium ${platColor[platform]}`}>
            {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </span>
          <span className="text-[#2a2a2a] text-xs hidden sm:block">1080×1080</span>
        </div>

        {/* ── Alignment toolbar (center) ── */}
        <div className="flex items-center gap-0.5">
          {alignButtons.map((btn, i) => (
            <button key={i} title={btn.label} onClick={btn.action}
              className="w-7 h-7 rounded flex items-center justify-center text-[#444] hover:text-white hover:bg-[#2a2a2a] transition-all">
              {btn.icon}
            </button>
          ))}

          <div className="w-px h-5 bg-[#2a2a2a] mx-1" />

          {/* Lock */}
          <button
            title="Lock/Unlock selected (Ctrl+L)"
            onClick={toggleLockSelected}
            className={`w-7 h-7 rounded flex items-center justify-center transition-all ${
              isLocked ? "text-amber-400 bg-amber-500/10" : "text-[#444] hover:text-white hover:bg-[#2a2a2a]"
            }`}
          >
            {isLocked ? <Lock size={13}/> : <Unlock size={13}/>}
          </button>

          {/* Group */}
          <button title="Group (Ctrl+G)" onClick={async () => {
            const canvas = fc.current; if (!canvas) return
            const active = canvas.getActiveObject(); if (!active) return
            const fabric = await import("fabric") as any
            if (active.type === "activeselection") {
              const grp = new fabric.Group(active.getObjects(), { id: crypto.randomUUID() })
              active.getObjects().forEach((o: any) => canvas.remove(o))
              canvas.discardActiveObject(); canvas.add(grp); canvas.setActiveObject(grp)
            } else if (active.type === "group") {
              const items = active.getObjects(); canvas.remove(active)
              items.forEach((item: any) => { item.set("id", crypto.randomUUID()); canvas.add(item) })
              canvas.discardActiveObject()
            }
            canvas.renderAll(); saveHistory()
          }}
            className="w-7 h-7 rounded flex items-center justify-center text-[#444] hover:text-white hover:bg-[#2a2a2a] transition-all">
            <Group size={13}/>
          </button>
        </div>

        {/* Right: save status + undo/redo + export */}
        <div className="flex items-center gap-1.5">
          {/* Save status */}
          {postDbId && (
            <span className={`text-[10px] flex items-center gap-1 mr-1 ${
              saveStatus === "saved"   ? "text-[#4ECB71]" :
              saveStatus === "saving"  ? "text-[#FFD95A]" : "text-[#555]"
            }`}>
              {saveStatus === "saved"  && <Check size={10}/>}
              {saveStatus === "saved"  ? "Saved" : saveStatus === "saving" ? "Saving…" : "Unsaved"}
            </span>
          )}

          <button onClick={undo} disabled={!canUndo}
            className="w-7 h-7 rounded flex items-center justify-center text-[#555] hover:text-white hover:bg-[#2a2a2a] disabled:opacity-30 transition-all"
            title="Undo (Ctrl+Z)"><Undo2 size={13}/></button>
          <button onClick={redo} disabled={!canRedo}
            className="w-7 h-7 rounded flex items-center justify-center text-[#555] hover:text-white hover:bg-[#2a2a2a] disabled:opacity-30 transition-all"
            title="Redo (Ctrl+Y)"><Redo2 size={13}/></button>

          <div className="w-px h-4 bg-[#2a2a2a] mx-0.5"/>

          <button onClick={() => exportCanvas("png")} disabled={exporting}
            className="flex items-center gap-1 bg-[#FD8D6E] hover:bg-[#fd7a58] text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 transition-colors disabled:opacity-50">
            <Download size={12}/> PNG
          </button>
          <button onClick={() => exportCanvas("jpeg")} disabled={exporting}
            className="flex items-center gap-1 bg-[#2a2a2a] hover:bg-[#333] text-white text-xs rounded-lg px-2.5 py-1.5 transition-colors disabled:opacity-50">
            <Download size={12}/> JPG
          </button>
        </div>
      </div>

      {/* ── Main ───────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        <ToolBar activeTool={activeTool} onToolChange={setActiveTool} onAddImage={() => imageInput.current?.click()} />

        <input ref={imageInput}   type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <input ref={bgImageInput} type="file" accept="image/*" className="hidden" onChange={handleBgImageUpload} />

        {/* Canvas area */}
        <div ref={ctrRef} className="flex-1 flex items-center justify-center bg-[#161616] overflow-hidden" style={gridStyle}>
          <div style={{ width: CS * scale, height: CS * scale, position: "relative", flexShrink: 0,
            boxShadow: "0 0 0 1px #2a2a2a, 0 20px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ width: CS, height: CS, transform: `scale(${scale})`,
              transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
              <canvas ref={canvasElRef} />
            </div>
          </div>
        </div>

        {/* Properties panel */}
        <div className="w-64 bg-[#111] border-l border-[#1e1e1e] flex flex-col flex-shrink-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-[#333] text-[10px] font-semibold uppercase tracking-widest mb-3">
              {selType === "text" ? "Text" : selType === "shape" ? "Shape" : selType === "image" ? "Image" : "Canvas"}
            </p>

            {/* Lock strip for object panels */}
            {selType !== "none" && (
              <LockStrip locked={isLocked} onToggle={toggleLockSelected} />
            )}

            {selType === "text"  && <TextPanel  {...textPanelProps} />}
            {selType === "shape" && <ShapePanel {...shapePanelProps} />}
            {selType === "image" && <ImagePanel {...imgPanelProps} />}
            {selType === "none"  && <CanvasPanel {...canvasPanelProps} />}

            {/* Position/size for object panels */}
            {selType !== "none" && (
              <PosSizeStrip
                x={objX} y={objY} w={objW} h={objH}
                onX={v => { setObjX(v); applyPosSizeToObj("left", v) }}
                onY={v => { setObjY(v); applyPosSizeToObj("top",  v) }}
                onW={v => { setObjW(v); applyPosSizeToObj("w",    v) }}
                onH={v => { setObjH(v); applyPosSizeToObj("h",    v) }}
              />
            )}
          </div>

          {/* Shortcuts hint */}
          <div className="p-3 border-t border-[#1e1e1e]">
            <p className="text-[#2a2a2a] text-[10px] leading-5">
              <span className="text-[#383838]">V</span> Select &nbsp;
              <span className="text-[#383838]">T</span> Text &nbsp;
              <span className="text-[#383838]">R</span> Rect &nbsp;
              <span className="text-[#383838]">E</span> Ellipse<br/>
              <span className="text-[#383838]">⌃L</span> Lock &nbsp;
              <span className="text-[#383838]">⌃G</span> Group &nbsp;
              <span className="text-[#383838]">⌃S</span> Save &nbsp;
              <span className="text-[#383838]">⌃Z</span> Undo
            </p>
          </div>
        </div>
      </div>

      {/* Layers */}
      <LayersPanel
        layers={layers} selectedId={selectedId}
        onSelect={selectById} onMoveUp={moveObjUp} onMoveDown={moveObjDown}
        onDelete={deleteById} onToggleLock={toggleLayerLock} onToggleVisible={toggleLayerVisible}
      />
    </div>
  )
}
