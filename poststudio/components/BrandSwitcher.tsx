"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, ChevronDown, Plus, Layers } from "lucide-react"

interface Brand {
  id: string
  name: string
  primaryColor: string
}

interface BrandSwitcherProps {
  brands: Brand[]
  activeBrand: Brand | null
}

export default function BrandSwitcher({ brands, activeBrand }: BrandSwitcherProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [switching, setSwitching] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function switchBrand(id: string) {
    if (id === activeBrand?.id) { setOpen(false); return }
    setSwitching(true)
    try {
      await fetch(`/api/brands/${id}`, { method: "PUT" })
      setOpen(false)
      router.refresh()
      toast.success("Brand switched")
    } catch {
      toast.error("Failed to switch brand")
    } finally {
      setSwitching(false)
    }
  }

  if (!activeBrand) return null

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={switching}
        className="flex items-center gap-2 bg-[#222] hover:bg-[#2a2a2a] border border-[#333] rounded-lg px-3 py-1.5 transition-all hover:border-[#444]"
      >
        <div
          className="w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-white/10"
          style={{ backgroundColor: activeBrand.primaryColor }}
        />
        <span className="text-white/80 text-sm font-medium max-w-[120px] truncate">
          {activeBrand.name}
        </span>
        <ChevronDown
          size={12}
          className={`text-[#555] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-52 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[#222]">
            <Layers size={12} className="text-[#444]" />
            <p className="text-[#444] text-[10px] font-semibold uppercase tracking-wider">
              Switch brand
            </p>
          </div>
          <div className="py-1">
            {brands.map((b) => (
              <button
                key={b.id}
                onClick={() => switchBrand(b.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left ${
                  b.id === activeBrand.id
                    ? "bg-[#222] text-white"
                    : "text-[#888] hover:bg-[#222] hover:text-white"
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: b.primaryColor }}
                />
                <span className="truncate flex-1">{b.name}</span>
                {b.id === activeBrand.id && (
                  <Check size={12} className="text-[#FD8D6E] flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
          <div className="border-t border-[#222] p-2">
            <a
              href="/brands"
              className="flex items-center gap-2 px-2 py-1.5 text-[#FD8D6E] text-xs hover:bg-[#FD8D6E]/10 rounded-lg transition-colors"
            >
              <Plus size={12} />
              Add brand
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
