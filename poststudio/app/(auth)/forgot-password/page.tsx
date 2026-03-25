"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <span className="text-2xl font-bold tracking-tight">
          <span className="text-[#FD8D6E]">Post</span>
          <span className="text-white">Studio</span>
        </span>
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8">
        {sent ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-4">📬</div>
            <h2 className="text-white font-semibold text-lg mb-2">Check your email</h2>
            <p className="text-[#888] text-sm">
              If an account exists for <span className="text-white">{email}</span>, you&apos;ll receive a reset link shortly.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-white text-xl font-semibold mb-2">Reset password</h1>
            <p className="text-[#666] text-sm mb-6">
              Enter your email and we&apos;ll send you a reset link.
            </p>
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
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FD8D6E] hover:bg-[#fc7a57] text-white font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-50"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          </>
        )}
      </div>

      <p className="text-center text-[#666] text-sm mt-4">
        <Link href="/login" className="text-[#FD8D6E] hover:underline">
          ← Back to sign in
        </Link>
      </p>
    </div>
  )
}
