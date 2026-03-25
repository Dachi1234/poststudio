"use client"

import type { ReactNode } from "react"
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, FlipHorizontal, FlipVertical, Lock, Unlock } from "lucide-react"
import { GOOGLE_FONTS, BRAND_COLORS } from "./fonts"

/* ─── Shared primitives ─────────────────────────────────────────────── */

function Label({ children }: { children: ReactNode }) {
  return (
    <p className="text-[#555] text-[10px] font-semibold uppercase tracking-wider mb-1">
      {children}
    </p>
  )
}

function Divider() {
  return <div className="w-full h-px bg-[#1e1e1e] my-1" />
}

function NumInput({ label, value, onChange, min = -9999, max = 9999 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[#444] text-[9px] uppercase tracking-wider">{label}</span>
      <input
        type="number" value={Math.round(value)} min={min} max={max}
        onChange={e => onChange(Number(e.target.value))}
        className="bg-[#1a1a1a] border border-[#2a2a2a] text-white text-xs rounded px-2 py-1 w-full focus:outline-none focus:border-[#FD8D6E] text-center"
      />
    </div>
  )
}

export function Slider({
  label, value, min, max, step = 1,
  onChange, display,
}: {
  label: string; value: number; min: number; max: number
  step?: number; onChange: (v: number) => void; display?: string
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <Label>{label}</Label>
        <span className="text-[#666] text-[10px]">{display ?? value}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1 bg-[#333] rounded-full appearance-none cursor-pointer accent-[#FD8D6E]"
      />
    </div>
  )
}

function ColorRow({ colors, value, onChange }: { colors: string[]; value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {colors.map(c => (
        <button
          key={c}
          onClick={() => onChange(c)}
          title={c}
          className="w-6 h-6 rounded-md transition-transform hover:scale-110 flex-shrink-0"
          style={{ backgroundColor: c, border: value === c ? "2px solid #FD8D6E" : "1px solid #333" }}
        />
      ))}
      <input
        type="color" value={value === "transparent" || !value ? "#000000" : value}
        onChange={e => onChange(e.target.value)}
        className="w-6 h-6 rounded-md cursor-pointer border border-[#333] bg-transparent"
        title="Custom color"
      />
    </div>
  )
}

/* ─── Lock strip (shown in every panel) ─────────────────────────────── */

export interface LockProps {
  locked: boolean
  onToggle: () => void
}

export function LockStrip({ locked, onToggle }: LockProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all mb-3 ${
        locked
          ? "bg-amber-500/15 border border-amber-500/30 text-amber-400"
          : "bg-[#1a1a1a] border border-[#2a2a2a] text-[#666] hover:text-white hover:border-[#444]"
      }`}
    >
      {locked ? <Lock size={12} /> : <Unlock size={12} />}
      {locked ? "Locked — click to unlock" : "Unlocked (Ctrl+L to lock)"}
    </button>
  )
}

/* ─── Position / Size strip (shown in every panel) ──────────────────── */

export interface PosSizeProps {
  x: number; y: number; w: number; h: number
  onX: (v: number) => void; onY: (v: number) => void
  onW: (v: number) => void; onH: (v: number) => void
}

export function PosSizeStrip({ x, y, w, h, onX, onY, onW, onH }: PosSizeProps) {
  return (
    <div>
      <Divider />
      <div className="mt-3">
        <Label>Position &amp; Size</Label>
        <div className="grid grid-cols-2 gap-2">
          <NumInput label="X" value={x} onChange={onX} />
          <NumInput label="Y" value={y} onChange={onY} />
          <NumInput label="W" value={w} onChange={onW} min={1} />
          <NumInput label="H" value={h} onChange={onH} min={1} />
        </div>
      </div>
    </div>
  )
}

/* ─── Text panel ────────────────────────────────────────────────────── */

export interface TextProps {
  fontFamily: string; setFontFamily: (v: string) => void
  fontSize:   number; setFontSize:   (v: number) => void
  fontWeight: string; setFontWeight: (v: string) => void
  textColor:  string; setTextColor:  (v: string) => void
  textAlign:  string; setTextAlign:  (v: string) => void
  italic:     boolean; setItalic:    (v: boolean) => void
  underline:  boolean; setUnderline: (v: boolean) => void
  lineHeight: number; setLineHeight: (v: number) => void
  charSpacing: number; setCharSpacing: (v: number) => void
}

export function TextPanel(p: TextProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label>Font</Label>
        <select
          value={p.fontFamily}
          onChange={e => p.setFontFamily(e.target.value)}
          className="w-full bg-[#222] border border-[#333] text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#FD8D6E]"
        >
          {GOOGLE_FONTS.map(f => (
            <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Size</Label>
          <div className="flex items-center gap-1">
            <button onClick={() => p.setFontSize(Math.max(6, p.fontSize - 2))}
              className="w-6 h-6 bg-[#222] border border-[#333] rounded text-white text-xs hover:bg-[#2a2a2a]">−</button>
            <input
              type="number" min={6} max={400} value={p.fontSize}
              onChange={e => p.setFontSize(Number(e.target.value))}
              className="flex-1 bg-[#222] border border-[#333] text-white text-xs rounded px-1 py-1 text-center focus:outline-none focus:border-[#FD8D6E] w-0"
            />
            <button onClick={() => p.setFontSize(Math.min(400, p.fontSize + 2))}
              className="w-6 h-6 bg-[#222] border border-[#333] rounded text-white text-xs hover:bg-[#2a2a2a]">+</button>
          </div>
        </div>
        <div>
          <Label>Weight</Label>
          <select
            value={p.fontWeight}
            onChange={e => p.setFontWeight(e.target.value)}
            className="w-full bg-[#222] border border-[#333] text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#FD8D6E]"
          >
            {[["300","Light"],["400","Regular"],["500","Medium"],["600","SemiBold"],["700","Bold"],["800","ExtraBold"]].map(([v,l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label>Style</Label>
        <div className="flex gap-1">
          {[
            { icon: <Bold size={13}/>,      active: Number(p.fontWeight) >= 600, onClick: () => p.setFontWeight(Number(p.fontWeight) >= 600 ? "400":"700") },
            { icon: <Italic size={13}/>,    active: p.italic,    onClick: () => p.setItalic(!p.italic) },
            { icon: <Underline size={13}/>, active: p.underline, onClick: () => p.setUnderline(!p.underline) },
          ].map((btn, i) => (
            <button key={i} onClick={btn.onClick}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                btn.active ? "bg-[#FD8D6E]/20 text-[#FD8D6E]" : "bg-[#222] border border-[#333] text-[#666] hover:text-white"
              }`}>
              {btn.icon}
            </button>
          ))}
          <div className="flex-1" />
          {(["left","center","right"] as const).map((v, i) => {
            const icons = [<AlignLeft size={13}/>, <AlignCenter size={13}/>, <AlignRight size={13}/>]
            return (
              <button key={v} onClick={() => p.setTextAlign(v)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  p.textAlign === v ? "bg-[#FD8D6E]/20 text-[#FD8D6E]" : "bg-[#222] border border-[#333] text-[#666] hover:text-white"
                }`}>
                {icons[i]}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <Label>Color</Label>
        <ColorRow colors={BRAND_COLORS} value={p.textColor} onChange={p.setTextColor} />
      </div>

      <Slider label="Line height" value={p.lineHeight} min={0.8} max={3} step={0.05}
        onChange={p.setLineHeight} display={p.lineHeight.toFixed(2)} />
      <Slider label="Letter spacing" value={p.charSpacing} min={-200} max={800} step={10}
        onChange={p.setCharSpacing} display={`${p.charSpacing}`} />
    </div>
  )
}

/* ─── Shape panel ───────────────────────────────────────────────────── */

export interface ShapeProps {
  fillColor:    string; setFillColor:    (v: string) => void
  strokeColor:  string; setStrokeColor:  (v: string) => void
  strokeWidth:  number; setStrokeWidth:  (v: number) => void
  cornerRadius: number; setCornerRadius: (v: number) => void
  opacity:      number; setOpacity:      (v: number) => void
  isRect:       boolean
}

export function ShapePanel(p: ShapeProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label>Fill</Label>
        <ColorRow colors={["transparent", ...BRAND_COLORS]} value={p.fillColor} onChange={p.setFillColor} />
      </div>
      <div>
        <Label>Stroke</Label>
        <ColorRow colors={["transparent", ...BRAND_COLORS]} value={p.strokeColor} onChange={p.setStrokeColor} />
      </div>
      <Slider label="Stroke width" value={p.strokeWidth} min={0} max={20} onChange={p.setStrokeWidth} />
      {p.isRect && (
        <Slider label="Corner radius" value={p.cornerRadius} min={0} max={200} onChange={p.setCornerRadius} />
      )}
      <Slider label="Opacity" value={p.opacity} min={0} max={100} onChange={p.setOpacity} display={`${p.opacity}%`} />
    </div>
  )
}

/* ─── Image panel ───────────────────────────────────────────────────── */

export interface ImagePanelProps {
  opacity:    number; setOpacity:    (v: number) => void
  brightness: number; setBrightness: (v: number) => void
  contrast:   number; setContrast:   (v: number) => void
  saturation: number; setSaturation: (v: number) => void
  blur:       number; setBlur:       (v: number) => void
  fillMode:   string; setFillMode:   (v: string) => void
  onFlipH:    () => void
  onFlipV:    () => void
}

export function ImagePanel(p: ImagePanelProps) {
  const modes = [
    { id: "cover",    label: "Cover"    },
    { id: "fit",      label: "Fit"      },
    { id: "stretch",  label: "Stretch"  },
    { id: "original", label: "Original" },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label>Fill mode</Label>
        <div className="grid grid-cols-2 gap-1">
          {modes.map(m => (
            <button
              key={m.id}
              onClick={() => p.setFillMode(m.id)}
              className={`text-xs rounded-lg py-1.5 transition-all ${
                p.fillMode === m.id
                  ? "bg-[#FD8D6E]/20 text-[#FD8D6E] border border-[#FD8D6E]/30"
                  : "bg-[#1a1a1a] border border-[#2a2a2a] text-[#666] hover:text-white"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <Slider label="Opacity"     value={p.opacity}     min={0}    max={100}  onChange={p.setOpacity}     display={`${p.opacity}%`} />
      <Slider label="Brightness"  value={p.brightness}  min={-100} max={100}  onChange={p.setBrightness}  display={`${p.brightness > 0 ? "+" : ""}${p.brightness}`} />
      <Slider label="Contrast"    value={p.contrast}    min={-100} max={100}  onChange={p.setContrast}    display={`${p.contrast > 0 ? "+" : ""}${p.contrast}`} />
      <Slider label="Saturation"  value={p.saturation}  min={-100} max={100}  onChange={p.setSaturation}  display={`${p.saturation > 0 ? "+" : ""}${p.saturation}`} />
      <Slider label="Blur"        value={p.blur}        min={0}    max={40}   onChange={p.setBlur} />
      <div>
        <Label>Flip</Label>
        <div className="flex gap-2">
          <button onClick={p.onFlipH} className="flex-1 flex items-center justify-center gap-1.5 bg-[#222] border border-[#333] text-[#aaa] hover:text-white text-xs rounded-lg py-2 transition-colors">
            <FlipHorizontal size={12} /> Horizontal
          </button>
          <button onClick={p.onFlipV} className="flex-1 flex items-center justify-center gap-1.5 bg-[#222] border border-[#333] text-[#aaa] hover:text-white text-xs rounded-lg py-2 transition-colors">
            <FlipVertical size={12} /> Vertical
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Canvas panel (no selection) ──────────────────────────────────── */

export interface CanvasPanelProps {
  bgColor:      string; setBgColor:      (v: string) => void
  bgImageUrl:   string; onBgImageUpload: () => void; onBgImageClear: () => void
  showGrid:     boolean; setShowGrid:    (v: boolean) => void
}

export function CanvasPanel({ bgColor, setBgColor, bgImageUrl, onBgImageUpload, onBgImageClear, showGrid, setShowGrid }: CanvasPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label>Background color</Label>
        <ColorRow
          colors={["#FFFFFF", "#111111", "#2E2E2E", "#F5F5F0", "#FD8D6E", "#5A8DEE", "#FFD95A", "#4ECB71"]}
          value={bgColor} onChange={setBgColor}
        />
      </div>

      <div>
        <Label>Background image</Label>
        <div className="flex gap-2">
          <button
            onClick={onBgImageUpload}
            className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#444] text-[#888] hover:text-white text-xs rounded-lg py-2 transition-colors"
          >
            {bgImageUrl ? "Replace" : "Upload image"}
          </button>
          {bgImageUrl && (
            <button
              onClick={onBgImageClear}
              className="bg-[#1a1a1a] border border-[#2a2a2a] hover:border-red-500/50 text-[#888] hover:text-red-400 text-xs rounded-lg px-3 py-2 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
        {bgImageUrl && (
          <div className="mt-2 rounded-lg overflow-hidden border border-[#2a2a2a] h-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bgImageUrl} alt="bg" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div>
        <Label>Grid</Label>
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`w-full text-xs rounded-lg py-2 transition-all ${
            showGrid
              ? "bg-[#FD8D6E]/20 border border-[#FD8D6E]/30 text-[#FD8D6E]"
              : "bg-[#1a1a1a] border border-[#2a2a2a] text-[#666] hover:text-white"
          }`}
        >
          {showGrid ? "Grid On" : "Grid Off"}
        </button>
      </div>
    </div>
  )
}
