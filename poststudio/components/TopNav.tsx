"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function TopNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-[#2E2E2E] z-40 border-b border-white/5 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#FD8D6E]" />
        <span className="font-[family-name:var(--font-inter)] font-semibold text-sm text-white">PostStudio</span>
      </div>

      <div className="flex items-center gap-6">
        <Link
          href="/create"
          className={`text-sm font-[family-name:var(--font-inter)] transition-colors ${
            pathname === "/create" ? "text-[#FD8D6E]" : "text-white/50 hover:text-white"
          }`}
        >
          Create
        </Link>
        <Link
          href="/history"
          className={`text-sm font-[family-name:var(--font-inter)] transition-colors ${
            pathname === "/history" ? "text-[#FD8D6E]" : "text-white/50 hover:text-white"
          }`}
        >
          History
        </Link>
      </div>

      <Link
        href="/create"
        className="bg-[#FD8D6E] text-[#2E2E2E] text-sm font-[family-name:var(--font-inter)] font-semibold rounded-md px-4 py-1.5 hover:opacity-90 transition-opacity"
      >
        New Post
      </Link>
    </nav>
  )
}
