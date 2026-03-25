"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import Moveable from "react-moveable"
import type { TemplateProps } from "../templates/types"
import type { ElementOverride, FieldInfo } from "./types"

/* ── Template registry ──────────────────────────────────────────── */

import BoldStatement    from "../templates/BoldStatement"
import SplitLayout      from "../templates/SplitLayout"
import GradientOverlay  from "../templates/GradientOverlay"
import GeometricBold    from "../templates/GeometricBold"
import BigQuote         from "../templates/BigQuote"
import StatCard         from "../templates/StatCard"
import BeforeAfter      from "../templates/BeforeAfter"
import Checklist        from "../templates/Checklist"
import TypographyPoster from "../templates/TypographyPoster"
import MinimalCard      from "../templates/MinimalCard"

const TEMPLATES: Record<string, React.ComponentType<TemplateProps>> = {
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

/* ── Props ──────────────────────────────────────────────────────── */

interface EditableTemplateProps {
  templateId: string
  templateProps: TemplateProps
  overrides: Record<string, ElementOverride>
  selectedField: string | null
  editingField: string | null
  scale: number
  onSelect: (field: string | null) => void
  onStartEditing: (field: string) => void
  onStopEditing: () => void
  onTextChange: (field: string, text: string) => void
  onTransform: (field: string, partial: Partial<ElementOverride>) => void
  onFieldsDetected?: (fields: FieldInfo[]) => void
}

/* ── Component ──────────────────────────────────────────────────── */

export default function EditableTemplate({
  templateId,
  templateProps,
  overrides,
  selectedField,
  editingField,
  scale,
  onSelect,
  onStartEditing,
  onStopEditing,
  onTextChange,
  onTransform,
  onFieldsDetected,
}: EditableTemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const targetRef    = useRef<HTMLElement | null>(null)
  const [moveableKey, setMoveableKey] = useState(0)

  /* Sync targetRef when selectedField changes (e.g. from layer panel) */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    if (selectedField) {
      const el = container.querySelector<HTMLElement>(`[data-field="${selectedField}"]`)
      if (el && el !== targetRef.current) {
        targetRef.current = el
        setMoveableKey(k => k + 1)
      }
    } else {
      if (targetRef.current) {
        targetRef.current = null
        setMoveableKey(k => k + 1)
      }
    }
  }, [selectedField])

  /* Detect all data-field elements and report to parent */
  useEffect(() => {
    const container = containerRef.current
    if (!container || !onFieldsDetected) return

    const timer = setTimeout(() => {
      const elements = container.querySelectorAll<HTMLElement>("[data-field]")
      const fields: FieldInfo[] = []
      elements.forEach((el) => {
        const computed = window.getComputedStyle(el)
        const bg = computed.backgroundColor
        const hasBackground = !!bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)"
        fields.push({
          field: el.dataset.field!,
          tag: el.tagName.toLowerCase(),
          text: el.innerText.slice(0, 40),
          hasBackground,
        })
      })
      onFieldsDetected(fields)
    }, 100)
    return () => clearTimeout(timer)
  }, [templateId, onFieldsDetected])

  /* Setup data-field elements */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const elements = container.querySelectorAll<HTMLElement>("[data-field]")
    elements.forEach((el) => {
      const field = el.dataset.field!
      const ov = overrides[field]
      const isEditing = editingField === field

      // Locked elements
      if (ov?.locked) {
        el.contentEditable = "false"
        el.style.cursor = "not-allowed"
        el.style.opacity = "0.5"
        return
      }

      // Fix inline elements for Moveable
      const computed = window.getComputedStyle(el)
      if (computed.display === "inline") {
        el.style.display = "inline-block"
      }

      /*
        Key distinction:
        - Selected but NOT editing → contentEditable=false, cursor=move (drag mode)
        - Editing → contentEditable=true, cursor=text (type mode)
        - Neither → contentEditable=false, cursor=pointer
      */
      if (isEditing) {
        el.contentEditable = "true"
        el.style.cursor = "text"
        el.style.outline = "2px solid rgba(253,141,110,0.6)"
        el.style.outlineOffset = "2px"
      } else if (selectedField === field) {
        el.contentEditable = "false"
        el.style.cursor = "move"
        el.style.outline = "none"
      } else {
        el.contentEditable = "false"
        el.style.cursor = "pointer"
        el.style.outline = "none"
      }
      el.spellcheck = false

      // Apply text/style overrides — use setProperty for max specificity
      if (ov) {
        if (ov.text !== undefined && !isEditing && el.innerText !== ov.text) el.innerText = ov.text
        if (ov.fontSize)   el.style.setProperty("font-size",   `${ov.fontSize}px`,   "important")
        if (ov.fontFamily) el.style.setProperty("font-family",  ov.fontFamily,        "important")
        if (ov.fontWeight) el.style.setProperty("font-weight",  ov.fontWeight,        "important")
        if (ov.color)      el.style.setProperty("color",        ov.color,             "important")
        if (ov.textAlign)  el.style.setProperty("text-align",   ov.textAlign,         "important")
        if (ov.opacity !== undefined) el.style.setProperty("opacity", String(ov.opacity), "important")
        // Shape overrides — use "background" (shorthand) to beat templates that also use shorthand
        if (ov.borderRadius !== undefined) el.style.setProperty("border-radius", `${ov.borderRadius}px`, "important")
        if (ov.backgroundColor) el.style.setProperty("background", ov.backgroundColor, "important")
        if (ov.paddingX !== undefined || ov.paddingY !== undefined) {
          const py = ov.paddingY ?? (parseFloat(window.getComputedStyle(el).paddingTop) || 0)
          const px = ov.paddingX ?? (parseFloat(window.getComputedStyle(el).paddingLeft) || 0)
          el.style.setProperty("padding", `${py}px ${px}px`, "important")
        }
        if (ov.borderWidth !== undefined) {
          el.style.setProperty("border-width", `${ov.borderWidth}px`, "important")
          el.style.setProperty("border-style", ov.borderWidth > 0 ? "solid" : "none", "important")
        }
        if (ov.borderColor) el.style.setProperty("border-color", ov.borderColor, "important")
        if (ov.letterSpacing !== undefined) el.style.setProperty("letter-spacing", `${ov.letterSpacing}px`, "important")
        if (ov.lineHeight !== undefined) el.style.setProperty("line-height", String(ov.lineHeight), "important")
        // Persist width/height from resize
        if (ov.width) {
          el.style.setProperty("width", `${ov.width}px`, "important")
          el.style.setProperty("display", "flex", "important")
        }
        if (ov.height) el.style.setProperty("height", `${ov.height}px`, "important")
      }

      // Apply transform overrides
      const tx = overrides[field]?.translateX ?? 0
      const ty = overrides[field]?.translateY ?? 0
      const rot = overrides[field]?.rotate ?? 0
      if (tx || ty || rot) {
        el.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg)`
      }

      // Hover highlight (only when not selected/editing)
      el.onmouseenter = () => {
        if (field !== selectedField && field !== editingField) {
          el.style.outline = "1px dashed rgba(253,141,110,0.4)"
        }
      }
      el.onmouseleave = () => {
        if (field !== selectedField && field !== editingField) {
          el.style.outline = "none"
        }
      }
    })
  }, [overrides, templateId, selectedField, editingField])

  /* Single click → select. Double click → enter text edit mode */
  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest("[data-field]") as HTMLElement | null
    if (target) {
      const field = target.dataset.field!
      if (overrides[field]?.locked) return

      if (selectedField === field) {
        // Already selected — second click enters edit mode
        onStartEditing(field)
      } else {
        // First click — select (exit any active editing)
        onStopEditing()
        onSelect(field)
        targetRef.current = target
        setMoveableKey(k => k + 1)
      }
    } else {
      onStopEditing()
      onSelect(null)
      targetRef.current = null
      setMoveableKey(k => k + 1)
    }
  }, [onSelect, onStartEditing, onStopEditing, overrides, selectedField])

  /* Also support real double-click for faster entry */
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest("[data-field]") as HTMLElement | null
    if (target) {
      const field = target.dataset.field!
      if (overrides[field]?.locked) return
      onSelect(field)
      targetRef.current = target
      onStartEditing(field)
      setMoveableKey(k => k + 1)
    }
  }, [onSelect, onStartEditing, overrides])

  /* Handle text input on contentEditable elements */
  const handleInput = useCallback((e: React.FormEvent) => {
    const target = (e.target as HTMLElement).closest("[data-field]") as HTMLElement | null
    if (!target) return
    const field = target.dataset.field!
    onTextChange(field, target.innerText)
  }, [onTextChange])

  /* Deselect when clicking outside the canvas */
  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onStopEditing()
      onSelect(null)
      targetRef.current = null
      setMoveableKey(k => k + 1)
    }
  }, [onSelect, onStopEditing])

  const Template = TEMPLATES[templateId]
  if (!Template) return null

  const selectedEl = targetRef.current
  // Show Moveable only when selected but NOT in text editing mode
  const hasTarget  = !!selectedField && !!selectedEl && !overrides[selectedField]?.locked && !editingField

  return (
    <div
      className="relative flex items-center justify-center flex-1 overflow-hidden bg-[#161616]"
      onClick={handleContainerClick}
    >
      {/* Outer wrapper */}
      <div
        style={{
          width:  1080 * scale,
          height: 1080 * scale,
          position: "relative",
          flexShrink: 0,
          boxShadow: "0 0 0 1px #2a2a2a, 0 20px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Inner container — full 1080px, CSS-scaled */}
        <div
          ref={containerRef}
          data-template-root
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onInput={handleInput}
          style={{
            width: 1080,
            height: 1080,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <Template {...templateProps} />

          {/* Moveable — only in select mode, hidden during text editing */}
          {hasTarget && (
            <Moveable
              key={moveableKey}
              target={selectedEl}
              container={containerRef.current}
              draggable
              resizable
              rotatable
              snappable
              snapDirections={{ top: true, left: true, bottom: true, right: true, center: true, middle: true }}
              elementSnapDirections={{ top: true, left: true, bottom: true, right: true, center: true, middle: true }}
              horizontalGuidelines={[0, 540, 1080]}
              verticalGuidelines={[0, 540, 1080]}
              snapThreshold={5}
              isDisplaySnapDigit={true}
              snapGap={true}
              throttleDrag={0}
              throttleResize={0}
              throttleRotate={0}
              zoom={1 / scale}
              origin={false}
              padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
              onDrag={({ target, translate }) => {
                target.style.transform = `translate(${translate[0]}px, ${translate[1]}px)`
                const field = (target as HTMLElement).dataset.field
                if (field) {
                  onTransform(field, {
                    translateX: translate[0],
                    translateY: translate[1],
                  })
                }
              }}
              onResize={({ target, width, height, drag }) => {
                target.style.width  = `${width}px`
                target.style.height = `${height}px`
                target.style.display = "flex"
                target.style.alignItems = "center"
                target.style.transform = `translate(${drag.translate[0]}px, ${drag.translate[1]}px)`
                const field = (target as HTMLElement).dataset.field
                if (field) {
                  onTransform(field, {
                    width,
                    height,
                    translateX: drag.translate[0],
                    translateY: drag.translate[1],
                  })
                }
              }}
              onRotate={({ target, rotate, drag }) => {
                const tx = drag.translate[0]
                const ty = drag.translate[1]
                target.style.transform = `translate(${tx}px, ${ty}px) rotate(${rotate}deg)`
                const field = (target as HTMLElement).dataset.field
                if (field) {
                  onTransform(field, { rotate, translateX: tx, translateY: ty })
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Selection indicator */}
      {selectedField && (
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="bg-[#FD8D6E] text-[#2E2E2E] text-[10px] font-semibold px-2 py-0.5 rounded">
            {selectedField}
          </span>
          {editingField && (
            <span className="bg-[#5A8DEE] text-white text-[10px] font-semibold px-2 py-0.5 rounded">
              editing text
            </span>
          )}
        </div>
      )}
    </div>
  )
}
