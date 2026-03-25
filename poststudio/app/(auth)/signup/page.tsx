"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Signup failed")
        return
      }

      // Auto sign in after signup
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      if (signInRes?.error) {
        toast.error("Account created — please sign in")
        router.push("/login")
      } else {
        router.push("/onboarding")
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
        <h1 className="text-white text-xl font-semibold mb-2">Create account</h1>
        <p className="text-[#666] text-sm mb-6">Start building your brand presence</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#888] text-xs font-medium mb-1.5 uppercase tracking-wider">
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Alex Johnson"
              className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-[#555] focus:outline-none focus:border-[#FD8D6E] transition-colors"
            />
          </div>

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
              placeholder="Min. 8 characters"
              minLength={8}
              className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-[#555] focus:outline-none focus:border-[#FD8D6E] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FD8D6E] hover:bg-[#fc7a57] text-white font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      </div>

      <p className="text-center text-[#666] text-sm mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-[#FD8D6E] hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}
