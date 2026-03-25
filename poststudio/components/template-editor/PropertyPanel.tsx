"use client"

import { Bold, AlignLeft, AlignCenter, AlignRight, Type, RotateCcw, Square, Circle, RectangleHorizontal } from "lucide-react"
import { GOOGLE_FONTS, BRAND_COLORS } from "../canvas/fonts"
import LayerPanel from "./LayerPanel"
import type { ElementOverride, FieldInfo } from "./types"

interface PropertyPanelProps {
  selectedField: string | null
  override: ElementOverride | undefined
  overrides: Record<string, ElementOverride>
  onChange: (partial: Partial<ElementOverride>) => void
  onResetField: () => void
  colorTheme: string
  onColorThemeChange: (theme: string) => void
  fields: FieldInfo[]
  onSelectField: (field: string) => void
  onToggleLock: (field: string) => void
  onToggleVisibility: (field: string) => void
}

const COLOR_THEMES = [
  { key: "coral",  color: "#FD8D6E", label: "Coral"  },
  { key: "blue",   color: "#5A8DEE", label: "Blue"   },
  { key: "dark",   color: "#2E2E2E", label: "Dark"   },
  { key: "yellow", color: "#FFD95A", label: "Yellow" },
]

const RADIUS_PRESETS = [
  { value: 999, label: "Pill",    Icon: RectangleHorizontal },
  { value: 12,  label: "Rounded", Icon: Square },
  { value: 0,   label: "Sharp",   Icon: Square },
]

export default function PropertyPanel({
  selectedField,
  override,
  overrides,
  onChange,
  onResetField,
  colorTheme,
  onColorThemeChange,
  fields,
  onSelectField,
  onToggleLock,
  onToggleVisibility,
}: PropertyPanelProps) {
  const ov = override ?? {}
  const selectedInfo = fields.find((f) => f.field === selectedField)
  const isShapeElement = selectedInfo?.hasBackground ?? false

  return (
    <div className="w-64 bg-[#111] border-l border-[#1e1e1e] flex flex-col flex-shrink-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto flex flex-col">

        {/* Layer panel */}
        <LayerPanel
          fields={fields}
          overrides={overrides}
          selectedField={selectedField}
          onSelect={onSelectField}
          onToggleLock={onToggleLock}
          onToggleVisibility={onToggleVisibility}
        />

        <div className="w-full h-px bg-[#1e1e1e]" />

        <div className="p-4 flex flex-col gap-4">
          {/* Color theme — always visible */}
          <div>
            <p className="text-[#555] text-[10px] font-semibold uppercase tracking-wider mb-2">Color Theme</p>
            <div className="flex gap-2">
              {COLOR_THEMES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => onColorThemeChange(t.key)}
                  title={t.label}
                  className="w-9 h-9 rounded-lg transition-all hover:scale-105"
                  style={{
                    backgroundColor: t.color,
                    border: colorTheme === t.key ? "3px solid white" : "2px solid #333",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="w-full h-px bg-[#1e1e1e]" />

          {selectedField ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-[#FD8D6E] text-[10px] font-semibold uppercase tracking-wider">
                  Editing: {selectedField}
                </p>
                <button
                  onClick={onResetField}
                  className="text-[#555] hover:text-[#FD8D6E] transition-colors"
                  title="Reset to default"
                >
                  <RotateCcw size={12} />
                </button>
              </div>

              {/* ── Shape controls (CTA buttons etc.) ─────────── */}
              {isShapeElement && (
                <>
                  <div>
                    <p className="text-[#555] text-[10px] font-semibold uppercase tracking-wider mb-1.5">Shape</p>
                    <div className="flex gap-1">
                      {RADIUS_PRESETS.map(({ value, label, Icon }) => (
                        <button
                          key={label}
                          onClick={() => onChange({ borderRadius: value })}
                          title={label}
                          className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1 text-[10px] transition-all ${
                            ov.borderRadius === value
                              ? "bg-[#FD8D6E] text-[#2E2E2E] font-bold"
                              : "bg-[#1a1a1a] text-[#666] hover:text-white border border-[#2a2a2a]"
                          }`}
                        >
                          <Icon size={11} />
                          {label}
                        </button>
                      ))}
                    </div>
                    {/* Custom radius slider */}
                    <div className="mt-2">
                      <input
                        type="range"
                        min={0} max={999} step={1}
                        value={ov.borderRadius ?? 999}
                        onChange={(e) => onChange({ borderRadius: Number(e.target.value) })}
                        className="w-full h-1 bg-[#333] rounded-full appearance-none cursor-pointer accent-[#FD8D6E]"
                      />
                      <p className="text-[#666] text-[10px] text-right mt-0.5">{ov.borderRadius ?? "default"}px</p>
                    </div>
                  </div>

                  {/* Background color */}
                  <div>
                    <p className="text-[#555] text-[10px] font-semibold uppercase tracking-wider mb-1">Background</p>
                    <div className="flex flex-wrap gap-1.5">
                      {BRAND_COLORS.map((c) => (
                        <button
                          key={`bg-${c}`}
                          onClick={() => onChange({ backgroundColor: c })}
                          title={c}
                          className="w-6 h-6 rounded-md transition-transform hover:scale-110 flex-shrink-0"
                          style={{
                            backgroundColor: c,
                            border: ov.backgroundColor === c ? "2px solid #FD8D6E" : "1px solid #333",
                          }}
                        />
                      ))}
                      <input
                        type="color"
                        value={ov.backgroundColor ?? "#FD8D6E"}
                        onChange={(e) => onChange({ backgroundColor: e.target.value })}
                        className="w-6 h-6 rounded-md cursor-pointer border border-[#333] bg-transparent"
                        title="Custom background"
                      />
                    </div>
                  </div>

                  {/* Padding */}
                  <div>
                    <p className="text-[#555] text-[10px] font-semibold uppercase tracking-wider mb-1">Padding</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[#444] text-[9px] mb-0.5">Horizontal</p>
                        <input
                          type="range"
                          min={0} max={80} step={2}
                          value={ov.paddingX ?? 36}
                          onChange={(e) => onChange({ paddingX: Number(e.target.value) })}
                          className="w-full h-1 bg-[#333] rounded-full appearance-none cursor-pointer accent-[#FD8D6E]"
                        />
                        <p className="text-[#666] text-[9px] text-right">{ov.paddingX ?? "default"}px</p>
                      </div>
                      <div>
                        <p className="text-[#444] text-[9px] mb-0.5">Vertical</p>
                        <input
                          type="range"
                          min={0} max={40} step={2}
                          value={ov.paddingY ?? 14}
                          onChange={(e) => onChange({ paddingY: Number(e.target.value) })}
                          className="w-full h-1 bg-[#333] rounded-full appearance-none cursor-pointer accent-[#FD8D6E]"
                        />
                        <p className="text-[#666] text-[9px] text-right">{ov.paddingY ?? "default"}px</p>
                      </div>
                    </div>
                  </div>

                  {/* Border */}
                  <div>
                    <p className="text-[#555] text-[10px] font-semibold uppercase tracking-wider mb-1">Border</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0} max={8} step={1}
                        value={ov.borderWidth ?? 0}
                        onChange={(e) => onChange({ borderWidth: Number(e.target.value) })}
                        className="flex-1 h-1 bg-[#333] rounded-full appearance-none cursor-pointer accent-[#FD8D6E]"
                      />
                      <p className="text-[#666] text-[10px] w-8 text-right">{ov.borderWidth ?? 0}px</p>
                    </div>
                    {(ov.borderWidth ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {["#FFFFFF", "#000000", "#FD8D6E", "#5A8DEE", "#2E2E2E"].map((c) => (
                          <button
                            key={`bdr-${c}`}
                            onClick={() => onChange({ borderColor: c })}
                            className="w-5 h-5 rounded-sm transition-transform hover:scale-110 flex-shrink-0"
                            style={{
                              backgroundColor: c,
                              border: ov.borderColor === c ? "2px solid #FD8D6E" : "1px solid #444",
                            }}
                          />
                        ))}
                        <input
                          type="color"
                          value={ov.borderColor ?? "#ffffff"}
                          onChange={(e) => onChange({ borderColor: e.target.value })}
                          className="w-5 h-5 rounded-sm cursor-pointer border border-[#444] bg-transparent"
                        />
                      </div>
                    )}
                  </div>

                  <div className="w-full h-px bg-[#1e1e1e]" />
                </>
              )}

              {/* ── Typography controls ────────────────────────── */}

              {/* Font family */}
              <div>
                <p className="text-[#555] text-[10px] font-semibold uppercase tracking-wider mb-1">Font</p>
                <select
                  value={ov.fontFamily ?? ""}
                  onChange={(e) => onChange({ fontFamily: e.target.value || undefined })}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-[#FD8D6E]"
                >
                  <option value="">Template default</option>
                  {GOOGLE_FONTS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              {/* Font size */}
              <div>
                <p className="text-[#555] text-[10px] font-semibold uppercase tracking-wider mb-1">Size</p>
                <input
                  type="range"
                  min={10} max={200} step={1}
                  value={ov.fontSize ?? 48}
                  onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
                  className="w-full h-1 bg-[#333] rounded-full appearance-none cursor-pointer accent-[#FD8D6E]"
                />
                <p className="text-[#666] text-[10px] text-right mt-0.5">{ov.fontSize ?? "default"}px</p>
              </div>

              {/* Font weight */}
              <div>
                <p className="text-[#555] text-[10px] font-semibold uppercase tracking-wider mb-1">Weight</p>
                <div className="flex gap-1">
                  {["400", "500", "600", "700", "800"].map((w) => (
                    <button
                      key={w}
                      onClick={() => onChange({ fontWeight: w })}
                      className={`flex-1 py-1 text-[10px] rounded transition-all ${
                        ov.fontWeight === w
                          ? "bg-[#FD8D6E] text-[#2E2E2E] font-bold"
                          : "bg-[#1a1a1a] text-[#666] hover:text-white border border-[#2a2a2a]"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style buttons */}
              <div>
                <p className="text-[#555] text-[10px] font-semibold uppercase tracking-wider mb-1">Style</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => onChange({ fontWeight: ov.fontWeight === "700" ? "400" : "700" })}
                    className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
                      Number(ov.fontWeight ?? 0) >= 700
                        ? "bg-[#FD8D6E]/20 text-[#FD8D6E]"
                        : "bg-[#1a1a1a] text-[#666] hover:text-white border border-[#2a2a2a]"
                    }`}
                  >
                    <Bold size={13} />
                  </button>
                  <button
                    onClick={() => onChange({ textAlign: "left" })}
                    className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
                      ov.textAlign === "left"
                        ? "bg-[#FD8D6E]/20 text-[#FD8D6E]"
                        : "bg-[#1a1a1a] text-[#666] hover:text-white border border-[#2a2a2a]"
                    }`}
                  >
                    <AlignLeft size={13} />
                  </button>
                  <button
                    onClick={() => onChange({ textAlign: "center" })}
                    className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
                      ov.textAlign === "center"
                        ? "bg-[#FD8D6E]/20 text-[#FD8D6E]"
                        : "bg-[#1a1a1a] text-[#666] hover:text-white border border-[#2a2a2a]"
                    }`}
                  >
                    <AlignCenter size={13} />
                  </button>
                  <button
                    onClick={() => onChange({ textAlign: "right" })}
                    className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
                      ov.textAlign === "right"
                        ? "bg-[#FD8D6E]/20 text-[#FD8D6E]"
                        : "bg-[#1a1a1a] text-[#666] hover:text-white border border-[#2a2a2a]"
                    }`}
                  >
                    <AlignRight size={13} />
                  </button>
                </div>
              </div>

              {/* Letter spacing + Line height */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[#555] text-[10px] font-semibold uppercase tracking-wider mb-1">Spacing</p>
                  <input
                    type="range"
                    min={-2} max={20} step={0.5}
                    value={ov.letterSpacing ?? 0}
                    onChange={(e) => onChange({ letterSpacing: Number(e.target.value) })}
                    className="w-full h-1 bg-[#333] rounded-full appearance-none cursor-pointer accent-[#FD8D6E]"
                  />
                  <p className="text-[#666] text-[9px] text-right mt-0.5">{ov.letterSpacing ?? 0}px</p>
                </div>
                <div>
                  <p className="text-[#555] text-[10px] font-semibold uppercase tracking-wider mb-1">Line H.</p>
                  <input
                    type="range"
                    min={0.6} max={2.5} step={0.05}
                    value={ov.lineHeight ?? 1.1}
                    onChange={(e) => onChange({ lineHeight: Number(e.target.value) })}
                    className="w-full h-1 bg-[#333] rounded-full appearance-none cursor-pointer accent-[#FD8D6E]"
                  />
                  <p className="text-[#666] text-[9px] text-right mt-0.5">{ov.lineHeight ?? "default"}</p>
                </div>
              </div>

              {/* Opacity */}
              <div>
                <p className="text-[#555] text-[10px] font-semibold uppercase tracking-wider mb-1">Opacity</p>
                <input
                  type="range"
                  min={0} max={1} step={0.05}
                  value={ov.opacity ?? 1}
                  onChange={(e) => onChange({ opacity: Number(e.target.value) })}
                  className="w-full h-1 bg-[#333] rounded-full appearance-none cursor-pointer accent-[#FD8D6E]"
                />
                <p className="text-[#666] text-[10px] text-right mt-0.5">{Math.round((ov.opacity ?? 1) * 100)}%</p>
              </div>

              {/* Text color */}
              <div>
                <p className="text-[#555] text-[10px] font-semibold uppercase tracking-wider mb-1">Text Color</p>
                <div className="flex flex-wrap gap-1.5">
                  {BRAND_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => onChange({ color: c })}
                      title={c}
                      className="w-6 h-6 rounded-md transition-transform hover:scale-110 flex-shrink-0"
                      style={{
                        backgroundColor: c,
                        border: ov.color === c ? "2px solid #FD8D6E" : "1px solid #333",
                      }}
                    />
                  ))}
                  <input
                    type="color"
                    value={ov.color ?? "#ffffff"}
                    onChange={(e) => onChange({ color: e.target.value })}
                    className="w-6 h-6 rounded-md cursor-pointer border border-[#333] bg-transparent"
                    title="Custom color"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <Type size={20} className="text-[#333]" />
              <p className="text-[#444] text-xs">Click any text element to edit</p>
              <p className="text-[#333] text-[10px]">Drag to move, resize handles to scale</p>
            </div>
          )}
        </div>
      </div>

      {/* Shortcuts hint */}
      <div className="p-3 border-t border-[#1e1e1e]">
        <p className="text-[#2a2a2a] text-[10px] leading-5">
          <span className="text-[#444]">Click</span> Select&nbsp;&nbsp;
          <span className="text-[#444]">Click again</span> Edit text<br />
          <span className="text-[#444]">Esc</span> Exit edit / Deselect<br />
          <span className="text-[#444]">Arrows</span> Nudge&nbsp;&nbsp;
          <span className="text-[#444]">Shift</span> 10px<br />
          <span className="text-[#444]">Ctrl+Z/Y</span> Undo/Redo&nbsp;&nbsp;
          <span className="text-[#444]">Ctrl+S</span> Export
        </p>
      </div>
    </div>
  )
}
