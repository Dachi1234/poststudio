"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import RichTextEditor from "@/components/RichTextEditor"

interface Brand {
  id: string
  name: string
  tagline?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  toneOfVoice?: string
  description?: string
  audience?: string
  websiteUrl?: string
  isDefault: boolean
}

const TONES = ["Professional", "Friendly", "Bold", "Playful", "Minimalist", "Luxury", "Educational"]
const FONTS = ["Inter", "Georgia", "Playfair Display", "Space Grotesk", "Roboto Mono"]

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Brand | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)

  const blank: Omit<Brand, "id" | "isDefault"> = {
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
  const [form, setForm] = useState(blank)

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then((d) => {
        setBrands(d.brands ?? [])
        setActiveBrandId(d.activeBrand?.id ?? null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function updateForm(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function startCreate() {
    setForm(blank)
    setEditing(null)
    setCreating(true)
  }

  function startEdit(b: Brand) {
    setForm(b)
    setCreating(false)
    setEditing(b)
  }

  async function handleSave() {
    if (!form.name) { toast.error("Brand name required"); return }
    setSaving(true)
    try {
      let res: Response
      if (editing) {
        res = await fetch(`/api/brands/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
      } else {
        res = await fetch("/api/brands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
      }
      if (!res.ok) throw new Error()
      const data = await res.json()

      if (editing) {
        setBrands((bs) => bs.map((b) => (b.id === editing.id ? data.brand : b)))
        toast.success("Brand updated")
      } else {
        setBrands((bs) => [...bs, data.brand])
        setActiveBrandId(data.brand.id)
        toast.success("Brand created")
      }
      setEditing(null)
      setCreating(false)
    } catch {
      toast.error("Failed to save")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this brand and all its posts?")) return
    try {
      await fetch(`/api/brands/${id}`, { method: "DELETE" })
      setBrands((bs) => bs.filter((b) => b.id !== id))
      toast.success("Brand deleted")
    } catch {
      toast.error("Failed to delete")
    }
  }

  async function handleSetActive(id: string) {
    try {
      await fetch(`/api/brands/${id}`, { method: "PUT" })
      setActiveBrandId(id)
      toast.success("Active brand switched")
    } catch {
      toast.error("Failed to switch brand")
    }
  }

  const showForm = creating || !!editing

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-2xl font-bold">Brands</h1>
            <p className="text-[#666] text-sm mt-1">Manage your brand profiles</p>
          </div>
          <button
            onClick={startCreate}
            className="bg-[#FD8D6E] hover:bg-[#fc7a57] text-white font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
          >
            + New brand
          </button>
        </div>

        {loading ? (
          <div className="text-[#555] text-sm">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {brands.map((b) => (
              <div
                key={b.id}
                className={`bg-[#222] rounded-xl p-5 border transition-colors ${
                  b.id === activeBrandId ? "border-[#FD8D6E]/40" : "border-[#2a2a2a]"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: b.primaryColor }}
                    >
                      {b.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold text-sm">{b.name}</p>
                        {b.id === activeBrandId && (
                          <span className="text-[10px] bg-[#FD8D6E]/20 text-[#FD8D6E] px-2 py-0.5 rounded-full font-medium">
                            Active
                          </span>
                        )}
                      </div>
                      {b.tagline && <p className="text-[#666] text-xs">{b.tagline}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-1.5 mb-4">
                  {[b.primaryColor, b.secondaryColor, b.accentColor].map((c, i) => (
                    <div key={i} className="w-5 h-5 rounded-md" style={{ backgroundColor: c }} />
                  ))}
                  <span className="text-[#555] text-xs ml-1 self-center">{b.toneOfVoice}</span>
                </div>

                <div className="flex gap-2">
                  {b.id !== activeBrandId && (
                    <button
                      onClick={() => handleSetActive(b.id)}
                      className="flex-1 bg-[#2a2a2a] hover:bg-[#333] text-[#aaa] hover:text-white text-xs rounded-lg py-1.5 transition-colors"
                    >
                      Set active
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(b)}
                    className="flex-1 bg-[#2a2a2a] hover:bg-[#333] text-[#aaa] hover:text-white text-xs rounded-lg py-1.5 transition-colors"
                  >
                    Edit
                  </button>
                  {brands.length > 1 && (
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="bg-[#2a2a2a] hover:bg-red-900/30 text-[#555] hover:text-red-400 text-xs rounded-lg px-3 py-1.5 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit form */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-lg">
                  {editing ? "Edit brand" : "New brand"}
                </h2>
                <button
                  onClick={() => { setCreating(false); setEditing(null) }}
                  className="text-[#555] hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#888] text-xs font-medium mb-1.5 uppercase tracking-wider">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateForm("name", e.target.value)}
                      placeholder="Brand name"
                      className="w-full bg-[#222] border border-[#333] rounded-lg px-3 py-2 text-white text-sm placeholder:text-[#555] focus:outline-none focus:border-[#FD8D6E] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#888] text-xs font-medium mb-1.5 uppercase tracking-wider">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={form.tagline}
                      onChange={(e) => updateForm("tagline", e.target.value)}
                      placeholder="Short tagline"
                      className="w-full bg-[#222] border border-[#333] rounded-lg px-3 py-2 text-white text-sm placeholder:text-[#555] focus:outline-none focus:border-[#FD8D6E] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#888] text-xs font-medium mb-1.5 uppercase tracking-wider">
                    Description
                  </label>
                  <RichTextEditor
                    value={form.description ?? ""}
                    onChange={(v) => updateForm("description", v)}
                    placeholder="What does your brand do? What makes it unique?"
                    minHeight={70}
                  />
                </div>

                <div>
                  <label className="block text-[#888] text-xs font-medium mb-1.5 uppercase tracking-wider">
                    Target audience
                  </label>
                  <RichTextEditor
                    value={form.audience ?? ""}
                    onChange={(v) => updateForm("audience", v)}
                    placeholder="Who are you speaking to? Age, profession, interests…"
                    minHeight={50}
                  />
                </div>

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
                      ] as [string, string][]
                    ).map(([field, label]) => (
                      <div key={field} className="flex flex-col items-center gap-1">
                        <input
                          type="color"
                          value={(form as Record<string, string>)[field]}
                          onChange={(e) => updateForm(field, e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer border border-[#333] bg-transparent"
                        />
                        <span className="text-[#666] text-[10px]">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[#888] text-xs font-medium mb-2 uppercase tracking-wider">
                    Tone of voice
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TONES.map((t) => (
                      <button
                        key={t}
                        onClick={() => updateForm("toneOfVoice", t)}
                        className={`px-3 py-1 rounded-lg text-xs transition-all ${
                          form.toneOfVoice === t
                            ? "bg-[#FD8D6E] text-white"
                            : "bg-[#222] border border-[#333] text-[#888] hover:border-[#555]"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[#888] text-xs font-medium mb-2 uppercase tracking-wider">
                    Font family
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FONTS.map((f) => (
                      <button
                        key={f}
                        onClick={() => updateForm("fontFamily", f)}
                        className={`px-3 py-1 rounded-lg text-xs transition-all ${
                          form.fontFamily === f
                            ? "bg-[#FD8D6E] text-white"
                            : "bg-[#222] border border-[#333] text-[#888] hover:border-[#555]"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setCreating(false); setEditing(null) }}
                    className="flex-1 bg-[#222] border border-[#333] text-[#aaa] hover:text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.name}
                    className="flex-1 bg-[#FD8D6E] hover:bg-[#fc7a57] text-white font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save brand"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
