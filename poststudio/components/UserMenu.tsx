"use client"

import { useState, useRef, useEffect } from "react"
import { signOut } from "next-auth/react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Palette, History, LogOut, ChevronDown } from "lucide-react"

export default function UserMenu() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
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

  if (!session?.user) return null

  const initials = (session.user.name ?? session.user.email ?? "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const plan = (session.user as { plan?: string }).plan ?? "free"

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="w-8 h-8 rounded-full bg-[#FD8D6E] flex items-center justify-center text-white text-xs font-bold select-none">
          {initials}
        </div>
        <ChevronDown
          size={12}
          className={`text-white/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* User info */}
          <div className="px-4 py-3 border-b border-[#2a2a2a]">
            <p className="text-white text-sm font-medium truncate">
              {session.user.name}
            </p>
            <p className="text-[#555] text-xs truncate">{session.user.email}</p>
            <span
              className={`inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                plan === "agency"
                  ? "bg-[#5A8DEE]/20 text-[#5A8DEE]"
                  : plan === "pro"
                  ? "bg-[#FD8D6E]/20 text-[#FD8D6E]"
                  : "bg-[#2a2a2a] text-[#666]"
              }`}
            >
              {plan}
            </span>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/brands"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[#aaa] text-sm hover:bg-[#222] hover:text-white transition-colors"
            >
              <Palette size={14} className="text-[#555]" />
              Brands
            </Link>
            <Link
              href="/history"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[#aaa] text-sm hover:bg-[#222] hover:text-white transition-colors"
            >
              <History size={14} className="text-[#555]" />
              Post history
            </Link>
          </div>

          <div className="border-t border-[#2a2a2a] py-1">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[#666] text-sm hover:bg-[#1f1212] hover:text-red-400 transition-colors text-left"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
