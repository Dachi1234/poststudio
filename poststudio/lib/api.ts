const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
const API_KEY = process.env.NEXT_PUBLIC_BACKEND_API_KEY || ""

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (API_KEY) headers["Authorization"] = `Bearer ${API_KEY}`
  return headers
}

export interface BrandForGeneration {
  name?: string
  description?: string
  audience?: string
  toneOfVoice?: string
  primaryColor?: string
  accentColor?: string
  secondaryColor?: string
}

export async function generateCopy(brief: {
  platform: string
  goal: string
  prompt: string
  toneOverride: string
  variations: number
  brand?: BrandForGeneration
}) {
  const res = await fetch(`${API_URL}/api/generate-copy`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(brief),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? "Copy generation failed")
  }
  return res.json()
}

export type ImageModel =
  | "gpt-image"
  | "nano-banana-pro"
  | "flux-2-max"
  | "flux-2-pro"
  | "recraft-v4-svg"
  | "flux-2-flex"
  | "ideogram-v3"
  | "recraft-v4"

export async function generateImage(params: {
  model: ImageModel
  prompt: string
  platform: string
  style?: string
  brand?: BrandForGeneration
}): Promise<{ imageUrl: string }> {
  const { model, ...body } = params
  const res = await fetch(`${API_URL}/api/generate-image/${model}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? `Image generation failed (${model})`)
  }
  return res.json()
}

export async function exportTemplate(params: {
  templateId: string
  post: object
  platform: string
  colorTheme: string
  format?: "png" | "jpeg"
}): Promise<Blob> {
  const res = await fetch(`${API_URL}/api/export-template`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? "Export failed")
  }
  return res.blob()
}

// Save a generated post to the DB
export async function savePost(post: {
  platform: string
  goal?: string
  brief?: string
  headline: string
  caption: string
  hashtags: string[]
  cta: string
  imageUrl?: string
  imageModel?: string
  templateId?: string
}) {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post),
  })
  if (!res.ok) return null
  return res.json()
}
