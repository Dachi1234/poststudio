const express   = require("express")
const router    = express.Router()
const Replicate = require("replicate")

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

const PLATFORM_SIZES = {
  instagram: { width: 1080, height: 1080, aspect: "1:1"  },
  linkedin:  { width: 1200, height: 627,  aspect: "16:9" },
  facebook:  { width: 1200, height: 630,  aspect: "16:9" },
}

/* ── Style hints for each model ───────────────────────────────────── */

function styleHint(modelKey, platform, brand = {}) {
  const fmt = platform === "instagram" ? "1:1 square" : "16:9 landscape"
  const primary = brand.primaryColor || "#FD8D6E"
  const accent  = brand.accentColor  || "#5A8DEE"
  const name    = brand.name || "Brand"

  const hints = {
    "gpt-image":      `Photorealistic, highly detailed, professional composition, cinematic lighting, ${fmt} social media post. No watermarks.`,
    "nano-banana-pro":`${name} brand. ${primary} and ${accent} palette. Clean minimal design. Warm professional. High fidelity. ${fmt}.`,
    "flux-2-max":     `Top-tier editorial photography, ultra-realistic, professional lighting, ${primary} and ${accent} accents. Award-winning composition. No text overlays. ${fmt}.`,
    "flux-2-pro":     `Professional photorealistic, editorial lifestyle photography, shallow depth of field, warm natural light. ${primary} and ${accent} accents. No watermarks. ${fmt}.`,
    "recraft-v4-svg": `Clean vector illustration, geometric shapes, brand-aligned graphic design. ${primary} and ${accent} palette. Minimal, scalable, professional. ${fmt}.`,
    "flux-2-flex":    `Sharp typography-friendly photography, precise details, professional marketing material. ${primary} and ${accent} color palette. Clean composition. ${fmt}.`,
    "ideogram-v3":    `${name} brand. ${primary} and ${accent} palette. Clean layout, precise text rendering. Warm professional. High quality. ${fmt}.`,
    "recraft-v4":     `Professional graphic design, bold visual identity, ${primary} and ${accent} palette. Clean, modern. ${fmt}.`,
  }
  return hints[modelKey] || hints["flux-2-pro"]
}

/* ── Universal output extractor ───────────────────────────────────── */

async function runModel(modelId, input) {
  const output = await replicate.run(modelId, { input })
  if (Array.isArray(output)) {
    const first = output[0]
    if (typeof first === "string") return first
    if (first && typeof first.url === "function") return first.url()
  }
  if (typeof output === "string") return output
  if (output && typeof output.url === "function") return output.url()
  throw new Error(`Unexpected output format from ${modelId}: ${JSON.stringify(output)}`)
}

/* ── Route factory ────────────────────────────────────────────────── */

function makeRoute(modelKey, modelId, buildInput) {
  return router.post(`/generate-image/${modelKey}`, async (req, res) => {
    const { prompt, platform, brand } = req.body
    if (!prompt || !platform) {
      return res.status(400).json({ error: "Missing prompt or platform" })
    }
    const sizes    = PLATFORM_SIZES[platform] || PLATFORM_SIZES.instagram
    const enhanced = `${prompt}. ${styleHint(modelKey, platform, brand)}`

    try {
      const imageUrl = await runModel(modelId, buildInput(enhanced, platform, sizes))
      return res.json({ imageUrl })
    } catch (err) {
      console.error(`[${modelKey}] error:`, err.message)
      return res.status(500).json({ error: "Image generation failed", detail: err.message })
    }
  })
}

/* ── FLUX.2 helpers ────────────────────────────────────────────────── */

function flux2Input(prompt, platform, sizes) {
  return {
    prompt,
    aspect_ratio: sizes.aspect,    // "1:1" | "16:9"
    output_format: "webp",
    output_quality: 90,
  }
}

/* ── Register all 8 models ─────────────────────────────────────────── */

// 1. GPT Image 1.5
makeRoute("gpt-image", "openai/gpt-image-1.5", (prompt, platform, sizes) => ({
  prompt,
  aspect_ratio: sizes.aspect,
  quality: "high",
  output_format: "webp",
}))

// 2. Nano Banana Pro (Google Imagen 3)
makeRoute("nano-banana-pro", "google/imagen-3", (prompt, platform, sizes) => ({
  prompt,
  aspect_ratio: sizes.aspect,
}))

// 3. FLUX.2 Max
makeRoute("flux-2-max", "black-forest-labs/flux-2-max", flux2Input)

// 4. FLUX.2 Pro
makeRoute("flux-2-pro", "black-forest-labs/flux-2-pro", flux2Input)

// 5. Recraft V4 SVG (vector output — URL to .svg file, works in <img> tags)
makeRoute("recraft-v4-svg", "recraft-ai/recraft-v4-svg", (prompt, _platform, sizes) => {
  const w = Math.round(sizes.width  / 64) * 64
  const h = Math.round(sizes.height / 64) * 64
  return { prompt, width: w, height: h }
})

// 6. FLUX.2 Flex
makeRoute("flux-2-flex", "black-forest-labs/flux-2-flex", flux2Input)

// 7. Ideogram v3
makeRoute("ideogram-v3", "ideogram-ai/ideogram-v3-balanced", (prompt, platform, sizes) => ({
  prompt,
  aspect_ratio: sizes.aspect,
  style_type: "DESIGN",
  magic_prompt_option: "AUTO",
}))

// 8. Recraft V4
makeRoute("recraft-v4", "recraft-ai/recraft-v4", (prompt, _platform, sizes) => {
  const w = Math.round(sizes.width  / 64) * 64
  const h = Math.round(sizes.height / 64) * 64
  return { prompt, width: w, height: h, style: "digital_illustration" }
})

module.exports = router
