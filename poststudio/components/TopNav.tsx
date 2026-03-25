"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import UserMenu from "./UserMenu"
import BrandSwitcher from "./BrandSwitcher"

interface Brand {
  id: string
  name: string
  primaryColor: string
}

export default function TopNav() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [brands, setBrands] = useState<Brand[]>([])
  const [activeBrand, setActiveBrand] = useState<Brand | null>(null)

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user")
        .then((r) => r.json())
        .then((d) => {
          setBrands(d.brands ?? [])
          setActiveBrand(d.activeBrand ?? null)
        })
        .catch(() => {})
    }
  }, [status, pathname])

  // Hide nav on auth pages
  const isAuthPage = ["/login", "/signup", "/forgot-password"].includes(pathname)
  if (isAuthPage) return null

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-[#2E2E2E] z-40 border-b border-white/5 flex items-center justify-between px-6">
      {/* Left: logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#FD8D6E]" />
          <span className="font-semibold text-sm text-white">PostStudio</span>
        </Link>

        {/* Brand switcher — only when logged in with brands */}
        {session && brands.length > 0 && (
          <>
            <span className="text-white/20 text-xs">/</span>
            <BrandSwitcher brands={brands} activeBrand={activeBrand} />
          </>
        )}
      </div>

      {/* Center: nav links */}
      {session && (
        <div className="flex items-center gap-6">
          <Link
            href="/create"
            className={`text-sm transition-colors ${
              pathname === "/create" ? "text-[#FD8D6E]" : "text-white/50 hover:text-white"
            }`}
          >
            Create
          </Link>
          <Link
            href="/history"
            className={`text-sm transition-colors ${
              pathname === "/history" ? "text-[#FD8D6E]" : "text-white/50 hover:text-white"
            }`}
          >
            History
          </Link>
          <Link
            href="/brands"
            className={`text-sm transition-colors ${
              pathname === "/brands" ? "text-[#FD8D6E]" : "text-white/50 hover:text-white"
            }`}
          >
            Brands
          </Link>
        </div>
      )}

      {/* Right: user menu or auth CTA */}
      <div className="flex items-center gap-3">
        {status === "loading" ? (
          <div className="w-8 h-8 rounded-full bg-[#333] animate-pulse" />
        ) : session ? (
          <UserMenu />
        ) : (
          <>
            <Link
              href="/login"
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-[#FD8D6E] text-white text-sm font-semibold rounded-lg px-4 py-1.5 hover:opacity-90 transition-opacity"
            >
              Get started
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
