"use client"

import { useState, useRef, useEffect } from "react"
import type { ReactNode } from "react"
import { Check, ChevronDown } from "lucide-react"

export interface SelectOption {
  value: string
  label: string
  description?: string
  icon?: ReactNode
}

interface PremiumSelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function PremiumSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  className = "",
}: PremiumSelectProps) {
  const [open, setOpen]       = useState(false)
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-3 bg-white/5 hover:bg-white/8 border rounded-lg px-3 py-2.5 text-left transition-all group ${
          open
            ? "border-[#FD8D6E]/60 bg-white/8"
            : "border-white/10 hover:border-white/20"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {mounted && selected?.icon && (
            <span className="text-[#FD8D6E] flex-shrink-0">{selected.icon}</span>
          )}
          <div className="min-w-0">
            {selected ? (
              <span className="text-white text-sm font-medium">{selected.label}</span>
            ) : (
              <span className="text-white/30 text-sm">{placeholder}</span>
            )}
            {selected?.description && (
              <p className="text-[#666] text-[11px] truncate">{selected.description}</p>
            )}
          </div>
        </div>
        <ChevronDown
          size={14}
          className={`text-[#555] flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-1.5 max-h-64 overflow-y-auto">
            {options.map((opt) => {
              const isSelected = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false) }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                    isSelected
                      ? "bg-[#FD8D6E]/10 text-white"
                      : "text-[#999] hover:bg-[#252525] hover:text-white"
                  }`}
                >
                  {mounted && opt.icon && (
                    <span className={`flex-shrink-0 ${isSelected ? "text-[#FD8D6E]" : "text-[#555]"}`}>
                      {opt.icon}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{opt.label}</p>
                    {opt.description && (
                      <p className={`text-[11px] mt-0.5 ${isSelected ? "text-[#FD8D6E]/60" : "text-[#555]"}`}>
                        {opt.description}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <Check size={13} className="text-[#FD8D6E] flex-shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
