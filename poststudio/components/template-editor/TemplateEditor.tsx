"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { X, Undo2, Redo2, Download, Copy, Image as ImageIcon } from "lucide-react"
import { toPng } from "html-to-image"
import EditableTemplate from "./EditableTemplate"
import PropertyPanel from "./PropertyPanel"
import type { TemplateEditorProps, ElementOverride, EditorState, FieldInfo } from "./types"

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"

export default function TemplateEditor({
  post,
  platform,
  templateId,
  colorTheme: initialTheme,
  postDbId,
  onClose,
}: TemplateEditorProps) {
  const [state, setState] = useState<EditorState>({
    overrides: {},
    selectedField: null,
  })
  const [colorTheme, setColorTheme] = useState(initialTheme)
  const [history, setHistory] = useState<EditorState[]>([])
  const [future, setFuture] = useState<EditorState[]>([])
  const [exporting, setExporting] = useState(false)
  const [scale, setScale] = useState(0.55)
  const [fields, setFields] = useState<FieldInfo[]>([])
  const [exportMethod, setExportMethod] = useState<"client" | "server">("client")
  const [editingField, setEditingField] = useState<string | null>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)

  /* ── History helpers ──────────────────────────────────────── */

  const pushHistory = useCallback(() => {
    setHistory((h) => [...h.slice(-30), state])
    setFuture([])
  }, [state])

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h
      const prev = h[h.length - 1]
      setFuture((f) => [state, ...f])
      setState(prev)
      return h.slice(0, -1)
    })
  }, [state])

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f
      const next = f[0]
      setHistory((h) => [...h, state])
      setState(next)
      return f.slice(1)
    })
  }, [state])

  /* ── Keyboard shortcuts ──────────────────────────────────── */

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isEditing = (e.target as HTMLElement).contentEditable === "true"

      // Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z always work
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        redo()
        return
      }

      // Ctrl+S — export
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        handleExport()
        return
      }

      // Skip the rest if we're typing text
      if (isEditing && !e.ctrlKey && !e.metaKey) return

      // Escape — exit editing first, then deselect
      if (e.key === "Escape") {
        e.preventDefault()
        if (editingField) {
          setEditingField(null)
        } else {
          setState((s) => ({ ...s, selectedField: null }))
        }
        return
      }

      // Delete/Backspace — reset selected element
      if ((e.key === "Delete" || e.key === "Backspace") && !isEditing && state.selectedField) {
        e.preventDefault()
        pushHistory()
        const field = state.selectedField
        setState((s) => {
          const newOverrides = { ...s.overrides }
          delete newOverrides[field]
          return { ...s, overrides: newOverrides }
        })
        return
      }

      // Arrow keys — nudge 1px (Shift: 10px)
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) && state.selectedField && !isEditing) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        const field = state.selectedField
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0

        setState((s) => ({
          ...s,
          overrides: {
            ...s.overrides,
            [field]: {
              ...s.overrides[field],
              translateX: (s.overrides[field]?.translateX ?? 0) + dx,
              translateY: (s.overrides[field]?.translateY ?? 0) + dy,
            },
          },
        }))
        return
      }

      // Ctrl+D — duplicate styles to clipboard notification
      if ((e.ctrlKey || e.metaKey) && e.key === "d" && state.selectedField) {
        e.preventDefault()
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo, state.selectedField, editingField, pushHistory])

  /* ── Handlers ─────────────────────────────────────────────── */

  const handleSelect = useCallback((field: string | null) => {
    setEditingField(null)
    setState((s) => ({ ...s, selectedField: field }))
  }, [])

  const handleStartEditing = useCallback((field: string) => {
    setEditingField(field)
  }, [])

  const handleStopEditing = useCallback(() => {
    setEditingField(null)
  }, [])

  const handleTextChange = useCallback((field: string, text: string) => {
    pushHistory()
    setState((s) => ({
      ...s,
      overrides: {
        ...s.overrides,
        [field]: { ...s.overrides[field], text },
      },
    }))
  }, [pushHistory])

  const handleTransform = useCallback((field: string, partial: Partial<ElementOverride>) => {
    setState((s) => ({
      ...s,
      overrides: {
        ...s.overrides,
        [field]: { ...s.overrides[field], ...partial },
      },
    }))
  }, [])

  const handlePropertyChange = useCallback((partial: Partial<ElementOverride>) => {
    if (!state.selectedField) return
    pushHistory()
    const field = state.selectedField
    setState((s) => ({
      ...s,
      overrides: {
        ...s.overrides,
        [field]: { ...s.overrides[field], ...partial },
      },
    }))
  }, [state.selectedField, pushHistory])

  const handleResetField = useCallback(() => {
    if (!state.selectedField) return
    pushHistory()
    const field = state.selectedField
    setState((s) => {
      const newOverrides = { ...s.overrides }
      delete newOverrides[field]
      return { ...s, overrides: newOverrides }
    })
  }, [state.selectedField, pushHistory])

  const handleToggleLock = useCallback((field: string) => {
    pushHistory()
    setState((s) => ({
      ...s,
      selectedField: s.selectedField === field ? null : s.selectedField,
      overrides: {
        ...s.overrides,
        [field]: {
          ...s.overrides[field],
          locked: !s.overrides[field]?.locked,
        },
      },
    }))
  }, [pushHistory])

  const handleToggleVisibility = useCallback((field: string) => {
    pushHistory()
    setState((s) => ({
      ...s,
      overrides: {
        ...s.overrides,
        [field]: {
          ...s.overrides[field],
          opacity: (s.overrides[field]?.opacity ?? 1) === 0 ? 1 : 0,
        },
      },
    }))
  }, [pushHistory])

  const handleFieldsDetected = useCallback((detected: FieldInfo[]) => {
    setFields(detected)
  }, [])

  /* ── Copy styles between elements ──────────────────────────── */

  const [copiedStyle, setCopiedStyle] = useState<Partial<ElementOverride> | null>(null)

  const handleCopyStyle = useCallback(() => {
    if (!state.selectedField) return
    const ov = state.overrides[state.selectedField]
    if (!ov) return
    // Copy only visual styles, not position/text
    const { text, translateX, translateY, rotate, width, height, locked, ...style } = ov
    setCopiedStyle(style)
  }, [state.selectedField, state.overrides])

  const handlePasteStyle = useCallback(() => {
    if (!state.selectedField || !copiedStyle) return
    pushHistory()
    const field = state.selectedField
    setState((s) => ({
      ...s,
      overrides: {
        ...s.overrides,
        [field]: { ...s.overrides[field], ...copiedStyle },
      },
    }))
  }, [state.selectedField, copiedStyle, pushHistory])

  /* ── Export ────────────────────────────────────────────────── */

  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      if (exportMethod === "client") {
        // Client-side export using html-to-image
        const container = canvasContainerRef.current
        if (!container) throw new Error("Container not found")

        // Find the 1080px template container (first child div's first child)
        const templateContainer = container.querySelector("[data-template-root]") as HTMLElement
        if (!templateContainer) throw new Error("Template container not found")

        // Temporarily deselect to hide Moveable handles
        const prevSelected = state.selectedField
        setState((s) => ({ ...s, selectedField: null }))

        // Wait a tick for React to clear Moveable
        await new Promise((r) => setTimeout(r, 100))

        const dataUrl = await toPng(templateContainer, {
          width: 1080,
          height: 1080,
          pixelRatio: 2,
          style: {
            transform: "none",
            width: "1080px",
            height: "1080px",
          },
        })

        // Restore selection
        if (prevSelected) {
          setState((s) => ({ ...s, selectedField: prevSelected }))
        }

        const link = document.createElement("a")
        link.download = `${templateId}-${Date.now()}.png`
        link.href = dataUrl
        link.click()
      } else {
        // Server-side export via Puppeteer
        const res = await fetch(`${BACKEND}/api/export-template`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateId,
            colorTheme,
            platform,
            post: {
              headline: state.overrides.headline?.text ?? post.headline,
              caption: state.overrides.caption?.text ?? post.caption,
              cta: state.overrides.cta?.text ?? post.cta,
              hashtags: post.hashtags,
              imageUrl: post.imageUrl,
            },
            overrides: state.overrides,
          }),
        })

        if (!res.ok) throw new Error("Export failed")

        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${templateId}-${Date.now()}.png`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error("Export failed:", err)
    } finally {
      setExporting(false)
    }
  }, [exportMethod, templateId, colorTheme, platform, state, post])

  /* ── Copy to clipboard ─────────────────────────────────────── */

  const handleCopyToClipboard = useCallback(async () => {
    setExporting(true)
    try {
      const container = canvasContainerRef.current
      if (!container) return

      const templateContainer = container.querySelector("[data-template-root]") as HTMLElement
      if (!templateContainer) return

      const prevSelected = state.selectedField
      setState((s) => ({ ...s, selectedField: null }))
      await new Promise((r) => setTimeout(r, 100))

      const dataUrl = await toPng(templateContainer, {
        width: 1080,
        height: 1080,
        pixelRatio: 2,
        style: { transform: "none", width: "1080px", height: "1080px" },
      })

      if (prevSelected) {
        setState((s) => ({ ...s, selectedField: prevSelected }))
      }

      // Convert data URL to blob for clipboard
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ])
    } catch (err) {
      console.error("Copy to clipboard failed:", err)
    } finally {
      setExporting(false)
    }
  }, [state.selectedField])

  /* ── Template props ────────────────────────────────────────── */

  const templateProps = {
    headline: state.overrides.headline?.text ?? post.headline,
    caption: state.overrides.caption?.text ?? post.caption,
    cta: state.overrides.cta?.text ?? post.cta,
    hashtags: post.hashtags,
    imageUrl: post.imageUrl,
    platform,
    primaryColor: undefined,
    colorTheme,
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="h-12 bg-[#111] border-b border-[#1e1e1e] flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#666] hover:text-white hover:bg-[#222] transition-all"
          >
            <X size={16} />
          </button>
          <span className="text-[#555] text-xs font-medium ml-2">Template Editor</span>
          <span className="text-[#333] text-xs">— {templateId}</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Undo / Redo */}
          <button
            onClick={undo}
            disabled={history.length === 0}
            className="w-8 h-8 rounded flex items-center justify-center text-[#666] hover:text-white disabled:opacity-20 transition-all"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className="w-8 h-8 rounded flex items-center justify-center text-[#666] hover:text-white disabled:opacity-20 transition-all"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={14} />
          </button>

          <div className="w-px h-5 bg-[#222] mx-2" />

          {/* Copy/Paste style */}
          {state.selectedField && (
            <>
              <button
                onClick={handleCopyStyle}
                className="w-8 h-8 rounded flex items-center justify-center text-[#666] hover:text-white transition-all"
                title="Copy style (from selected)"
              >
                <Copy size={13} />
              </button>
              {copiedStyle && (
                <button
                  onClick={handlePasteStyle}
                  className="w-8 h-8 rounded flex items-center justify-center text-[#FD8D6E] hover:text-white transition-all"
                  title="Paste style (to selected)"
                >
                  <Copy size={13} className="rotate-180" />
                </button>
              )}
              <div className="w-px h-5 bg-[#222] mx-2" />
            </>
          )}

          {/* Zoom */}
          <div className="flex items-center gap-1">
            {[0.35, 0.55, 0.75, 1].map((z) => (
              <button
                key={z}
                onClick={() => setScale(z)}
                className={`px-2 py-1 text-[10px] rounded transition-all ${
                  scale === z
                    ? "bg-[#FD8D6E] text-[#2E2E2E] font-bold"
                    : "text-[#555] hover:text-white"
                }`}
              >
                {Math.round(z * 100)}%
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-[#222] mx-2" />

          {/* Export method toggle */}
          <div className="flex items-center bg-[#1a1a1a] rounded-md overflow-hidden">
            <button
              onClick={() => setExportMethod("client")}
              className={`px-2 py-1 text-[10px] transition-all ${
                exportMethod === "client" ? "bg-[#333] text-white" : "text-[#555]"
              }`}
              title="Client-side export (fast, no server needed)"
            >
              <ImageIcon size={12} />
            </button>
            <button
              onClick={() => setExportMethod("server")}
              className={`px-2 py-1 text-[10px] transition-all ${
                exportMethod === "server" ? "bg-[#333] text-white" : "text-[#555]"
              }`}
              title="Server-side export (Puppeteer, pixel-perfect)"
            >
              HD
            </button>
          </div>

          {/* Copy to clipboard */}
          <button
            onClick={handleCopyToClipboard}
            disabled={exporting}
            className="h-8 px-3 text-[#999] hover:text-white text-xs rounded-lg flex items-center gap-1 hover:bg-[#222] disabled:opacity-40 transition-all"
            title="Copy image to clipboard"
          >
            <Copy size={13} />
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="h-8 px-4 bg-[#FD8D6E] text-[#2E2E2E] text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:opacity-90 disabled:opacity-40 transition-all"
          >
            <Download size={13} />
            {exporting ? "Exporting..." : "Export PNG"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div ref={canvasContainerRef} className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <EditableTemplate
          templateId={templateId}
          templateProps={templateProps}
          overrides={state.overrides}
          selectedField={state.selectedField}
          editingField={editingField}
          scale={scale}
          onSelect={handleSelect}
          onStartEditing={handleStartEditing}
          onStopEditing={handleStopEditing}
          onTextChange={handleTextChange}
          onTransform={handleTransform}
          onFieldsDetected={handleFieldsDetected}
        />

        {/* Property panel with layers */}
        <PropertyPanel
          selectedField={state.selectedField}
          override={state.overrides[state.selectedField ?? ""]}
          overrides={state.overrides}
          onChange={handlePropertyChange}
          onResetField={handleResetField}
          colorTheme={colorTheme}
          onColorThemeChange={setColorTheme}
          fields={fields}
          onSelectField={(field) => handleSelect(field)}
          onToggleLock={handleToggleLock}
          onToggleVisibility={handleToggleVisibility}
        />
      </div>
    </div>
  )
}
