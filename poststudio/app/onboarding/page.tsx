"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import RichTextEditor from "@/components/RichTextEditor"

const TONES = ["Professional", "Friendly", "Bold", "Playful", "Minimalist", "Luxury", "Educational"]
const FONTS = ["Inter", "Georgia", "Playfair Display", "Space Grotesk", "Roboto Mono"]

interface BrandData {
  name: string
  tagline: string
  description: string
  audience: string
  toneOfVoice: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  websiteUrl: string
}

const EMPTY: BrandData = {
  name: "",
  tagline: "",
  description: "",
  audience: "",
  toneOfVoice: "Professional",
  primaryColor: "#FD8D6E",
  secondaryColor: "#2E2E2E",
  accentColor: "#5A8DEE",
  fontFamily: "Inter",
  websiteUrl: "",
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [brand, setBrand] = useState<BrandData>(EMPTY)
  const [url, setUrl] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)

  function update(field: keyof BrandData, value: string) {
    setBrand((b) => ({ ...b, [field]: value }))
  }

  async function analyzeUrl() {
    if (!url) return
    setAnalyzing(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
      const res = await fetch(`${apiUrl}/api/analyze-brand`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })
      if (!res.ok) throw new Error("Analysis failed")
      const data = await res.json()
      setBrand((b) => ({
        ...b,
        name: data.name ?? b.name,
        tagline: data.tagline ?? b.tagline,
        description: data.description ?? b.description,
        audience: data.audience ?? b.audience,
        toneOfVoice: data.toneOfVoice ?? b.toneOfVoice,
        primaryColor: data.primaryColor ?? b.primaryColor,
        websiteUrl: url,
      }))
      setStep(2)
    } catch {
      toast.error("Couldn't analyze the URL — fill details manually")
      setStep(2)
    } finally {
      setAnalyzing(false)
    }
  }

  async function saveBrand() {
    if (!brand.name) {
      toast.error("Brand name is required")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brand),
      })
      if (!res.ok) throw new Error("Save failed")
      setStep(4)
    } catch {
      toast.error("Failed to save brand")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center p-6">
      {/* Progress */}
      <div className="w-full max-w-lg mb-8">
        <div className="flex items-center gap-2 mb-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  s <= step ? "bg-[#FD8D6E]" : "bg-[#2a2a2a]"
                }`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-[#555]">
          <span>Website</span>
          <span>Details</span>
          <span>Preview</span>
          <span>Done</span>
        </div>
      </div>

      <div className="w-full max-w-lg">
        {/* Step 1 — URL */}
        {step === 1 && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8">
            <h1 className="text-white text-2xl font-bold mb-2">Set up your brand</h1>
            <p className="text-[#666] text-sm mb-6">
              Enter your website and we&apos;ll extract your brand identity automatically.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[#888] text-xs font-medium mb-1.5 uppercase tracking-wider">
                  Website URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-[#555] focus:outline-none focus:border-[#FD8D6E] transition-colors"
                />
              </div>

              <button
                onClick={analyzeUrl}
                disabled={analyzing || !url}
                className="w-full bg-[#FD8D6E] hover:bg-[#fc7a57] text-white font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-50"
              >
                {analyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing your brand…
                  </span>
                ) : (
                  "Analyze & continue"
                )}
              </button>

              <button
                onClick={() => setStep(2)}
                className="w-full text-[#555] hover:text-[#888] text-sm py-2 transition-colors"
              >
                Skip — I&apos;ll fill it manually
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Manual details */}
        {step === 2 && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8">
            <h1 className="text-white text-xl font-bold mb-1">Review your brand details</h1>
            <p className="text-[#666] text-sm mb-6">Edit anything that doesn&apos;t look right.</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#888] text-xs font-medium mb-1.5 uppercase tracking-wider">
                    Brand name *
                  </label>
                  <input
                    type="text"
                    value={brand.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full bg-[#222] border border-[#333] rounded-lg px-3 py-2 text-white text-sm placeholder:text-[#555] focus:outline-none focus:border-[#FD8D6E] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#888] text-xs font-medium mb-1.5 uppercase tracking-wider">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={brand.tagline}
                    onChange={(e) => update("tagline", e.target.value)}
                    placeholder="Your short tagline"
                    className="w-full bg-[#222] border border-[#333] rounded-lg px-3 py-2 text-white text-sm placeholder:text-[#555] focus:outline-none focus:border-[#FD8D6E] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#888] text-xs font-medium mb-1.5 uppercase tracking-wider">
                  Description
                </label>
                <RichTextEditor
                  value={brand.description}
                  onChange={(v) => update("description", v)}
                  placeholder="What does your brand do? What makes it unique?"
                  minHeight={70}
                />
              </div>

              <div>
                <label className="block text-[#888] text-xs font-medium mb-1.5 uppercase tracking-wider">
                  Target audience
                </label>
                <RichTextEditor
                  value={brand.audience}
                  onChange={(v) => update("audience", v)}
                  placeholder="Who are you speaking to? Age, profession, interests…"
                  minHeight={50}
                />
              </div>

              {/* Colors */}
              <div>
                <label className="block text-[#888] text-xs font-medium mb-2 uppercase tracking-wider">
                  Brand colors
                </label>
                <div className="flex gap-4">
                  {(
                    [
                      ["primaryColor", "Primary"],
                      ["secondaryColor", "Secondary"],
                      ["accentColor", "Accent"],
                    ] as [keyof BrandData, string][]
                  ).map(([field, label]) => (
                    <div key={field} className="flex flex-col items-center gap-1">
                      <input
                        type="color"
                        value={brand[field]}
                        onChange={(e) => update(field, e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-[#333] bg-transparent"
                      />
                      <span className="text-[#666] text-[10px]">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-[#888] text-xs font-medium mb-2 uppercase tracking-wider">
                  Tone of voice
                </label>
                <div className="flex flex-wrap gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t}
                      onClick={() => update("toneOfVoice", t)}
                      className={`px-3 py-1 rounded-lg text-xs transition-all ${
                        brand.toneOfVoice === t
                          ? "bg-[#FD8D6E] text-white"
                          : "bg-[#222] border border-[#333] text-[#888] hover:border-[#555]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font */}
              <div>
                <label className="block text-[#888] text-xs font-medium mb-2 uppercase tracking-wider">
                  Font family
                </label>
                <div className="flex flex-wrap gap-2">
                  {FONTS.map((f) => (
                    <button
                      key={f}
                      onClick={() => update("fontFamily", f)}
                      className={`px-3 py-1 rounded-lg text-xs transition-all ${
                        brand.fontFamily === f
                          ? "bg-[#FD8D6E] text-white"
                          : "bg-[#222] border border-[#333] text-[#888] hover:border-[#555]"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={!brand.name}
                className="w-full bg-[#FD8D6E] hover:bg-[#fc7a57] text-white font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-40"
              >
                Preview my brand →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Preview */}
        {step === 3 && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8">
            <h1 className="text-white text-xl font-bold mb-1">Preview</h1>
            <p className="text-[#666] text-sm mb-6">Here&apos;s how your brand looks in PostStudio.</p>

            {/* Brand card preview */}
            <div
              className="rounded-xl p-6 mb-6"
              style={{ backgroundColor: brand.primaryColor + "20", borderColor: brand.primaryColor + "40", border: "1px solid" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: brand.primaryColor }}
                >
                  {brand.name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold">{brand.name}</p>
                  {brand.tagline && <p className="text-[#888] text-xs">{brand.tagline}</p>}
                </div>
              </div>
              {brand.description && (
                <p className="text-[#aaa] text-sm leading-relaxed">{brand.description}</p>
              )}
              <div className="flex gap-2 mt-4">
                {[brand.primaryColor, brand.secondaryColor, brand.accentColor].map((c, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-md"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
                <span className="text-[#666] text-xs ml-1 self-center">
                  {brand.toneOfVoice} · {brand.fontFamily}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-[#222] border border-[#333] text-[#aaa] hover:text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
              >
                ← Edit
              </button>
              <button
                onClick={saveBrand}
                disabled={saving}
                className="flex-1 bg-[#FD8D6E] hover:bg-[#fc7a57] text-white font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save & get started →"}
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Done */}
        {step === 4 && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-white text-2xl font-bold mb-2">
              {brand.name} is ready!
            </h1>
            <p className="text-[#666] text-sm mb-8">
              Your brand profile is set up. Start creating on-brand social posts.
            </p>
            <button
              onClick={() => router.push("/create")}
              className="bg-[#FD8D6E] hover:bg-[#fc7a57] text-white font-semibold rounded-lg px-8 py-3 text-sm transition-colors"
            >
              Start creating →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
