"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const callbackUrl = params.get("callbackUrl") ?? "/create"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      if (res?.error) {
        toast.error("Invalid email or password")
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <span className="text-2xl font-bold tracking-tight">
          <span className="text-[#FD8D6E]">Post</span>
          <span className="text-white">Studio</span>
        </span>
        <p className="text-[#888] text-sm mt-1">AI-powered social media creation</p>
      </div>

      {/* Card */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8">
        <h1 className="text-white text-xl font-semibold mb-6">Sign in</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#888] text-xs font-medium mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-[#555] focus:outline-none focus:border-[#FD8D6E] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#888] text-xs font-medium mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-[#555] focus:outline-none focus:border-[#FD8D6E] transition-colors"
            />
          </div>

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-[#FD8D6E] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FD8D6E] hover:bg-[#fc7a57] text-white font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>

      <p className="text-center text-[#666] text-sm mt-4">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[#FD8D6E] hover:underline font-medium">
          Create account
        </Link>
      </p>
    </div>
  )
}
