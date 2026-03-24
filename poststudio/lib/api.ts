const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function generateCopy(brief: {
  platform: string
  goal: string
  prompt: string
  toneOverride: string
  variations: number
}) {
  const res = await fetch(`${API_URL}/api/generate-copy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(brief),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? "Copy generation failed")
  }
  return res.json()
}

export async function generateImage(params: {
  model: "flux" | "flux-pro" | "recraft" | "ideogram" | "nano-banana" | "nano-banana-pro"
  prompt: string
  platform: string
  style?: string
}): Promise<{ imageUrl: string }> {
  const { model, ...body } = params
  const res = await fetch(`${API_URL}/api/generate-image/${model}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? "Export failed")
  }
  return res.blob()
}
