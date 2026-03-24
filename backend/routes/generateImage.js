const express   = require("express")
const router    = express.Router()
const Replicate = require("replicate")

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

const PLATFORM_SIZES = {
  instagram: { width: 1080, height: 1080, aspect: "1:1"  },
  linkedin:  { width: 1200, height: 627,  aspect: "16:9" },
  facebook:  { width: 1200, height: 630,  aspect: "16:9" },
}

function enhancePrompt(prompt, platform, style) {
  const fmt = platform === "instagram" ? "1:1 square format" : "16:9 landscape format"

  const hints = {
    flux:        `Shot on iPhone 15 Pro, candid editorial, shallow depth of field, warm natural window light, slightly warm color grade. Coral #FD8D6E and blue #5A8DEE as subtle accents. No text overlays. No watermarks. ${fmt}.`,
    "flux-pro":  `Editorial lifestyle photography, shallow depth of field, warm natural light, slightly desaturated warm color grade. Coral #FD8D6E and blue #5A8DEE color accents. Professional photorealistic. No text. No watermarks. ${fmt}.`,
    recraft:     `CodeLess brand. Coral #FD8D6E and blue #5A8DEE palette. Clean minimal graphic design. Professional marketing material. Georgian young professionals. Warm friendly tone. ${fmt}.`,
    ideogram:          `CodeLess brand. Coral #FD8D6E and blue #5A8DEE palette. Clean minimal layout. Inter font style. Warm professional. Georgian context. High quality. ${fmt}.`,
    "nano-banana":     `Warm natural lighting, slightly warm color grade. Coral #FD8D6E and blue #5A8DEE accents. Professional lifestyle. Georgian young professionals. No text overlays. ${fmt}.`,
    "nano-banana-pro": `CodeLess brand. Coral #FD8D6E and blue #5A8DEE palette. Inter font for any text. Clean minimal graphic design. Warm professional. Georgian context. High fidelity. ${fmt}.`,
  }

  return `${prompt}. ${hints[style] || hints.flux}`
}

async function runModel(model, input) {
  const output = await replicate.run(model, { input })
  if (Array.isArray(output)) {
    const first = output[0]
    if (typeof first === "string") return first
    if (first && typeof first.url === "function") return first.url()
  }
  if (typeof output === "string") return output
  if (output && typeof output.url === "function") return output.url()
  throw new Error(`Unexpected output format from ${model}`)
}

// FLUX Schnell — fast preview
router.post("/generate-image/flux", async (req, res) => {
  const { prompt, platform } = req.body
  if (!prompt || !platform) return res.status(400).json({ error: "Missing prompt or platform" })

  const { width, height } = PLATFORM_SIZES[platform] || PLATFORM_SIZES.instagram
  // FLUX requires dimensions divisible by 16
  const w = Math.round(width  / 16) * 16
  const h = Math.round(height / 16) * 16

  try {
    const imageUrl = await runModel("black-forest-labs/flux-schnell", {
      prompt: enhancePrompt(prompt, platform, "flux"),
      width: w, height: h,
      num_outputs: 1,
      output_format: "webp",
    })
    return res.json({ imageUrl })
  } catch (err) {
    console.error("FLUX error:", err)
    return res.status(500).json({ error: "Image generation failed", detail: err.message })
  }
})

// FLUX Pro — best quality photo
router.post("/generate-image/flux-pro", async (req, res) => {
  const { prompt, platform } = req.body
  if (!prompt || !platform) return res.status(400).json({ error: "Missing prompt or platform" })

  const { width, height } = PLATFORM_SIZES[platform] || PLATFORM_SIZES.instagram
  const w = Math.round(width  / 16) * 16
  const h = Math.round(height / 16) * 16

  try {
    const imageUrl = await runModel("black-forest-labs/flux-1.1-pro", {
      prompt: enhancePrompt(prompt, platform, "flux-pro"),
      width: w, height: h,
      output_format: "webp",
      output_quality: 90,
      safety_tolerance: 2,
    })
    return res.json({ imageUrl })
  } catch (err) {
    console.error("FLUX Pro error:", err)
    return res.status(500).json({ error: "Image generation failed", detail: err.message })
  }
})

// Recraft v3 — graphic design / illustration
router.post("/generate-image/recraft", async (req, res) => {
  const { prompt, platform, style: recraftStyle } = req.body
  if (!prompt || !platform) return res.status(400).json({ error: "Missing prompt or platform" })

  const { width, height } = PLATFORM_SIZES[platform] || PLATFORM_SIZES.instagram
  // Recraft requires dimensions divisible by 64
  const w = Math.round(width  / 64) * 64
  const h = Math.round(height / 64) * 64

  try {
    const imageUrl = await runModel("recraft-ai/recraft-v3", {
      prompt: enhancePrompt(prompt, platform, "recraft"),
      style: recraftStyle || "digital_illustration",
      width: w, height: h,
    })
    return res.json({ imageUrl })
  } catch (err) {
    console.error("Recraft error:", err)
    return res.status(500).json({ error: "Image generation failed", detail: err.message })
  }
})

// Ideogram v3 Turbo — text-friendly graphic design
router.post("/generate-image/ideogram", async (req, res) => {
  const { prompt, platform } = req.body
  if (!prompt || !platform) return res.status(400).json({ error: "Missing prompt or platform" })

  const { aspect } = PLATFORM_SIZES[platform] || PLATFORM_SIZES.instagram

  try {
    const imageUrl = await runModel("ideogram-ai/ideogram-v3-turbo", {
      prompt: enhancePrompt(prompt, platform, "ideogram"),
      aspect_ratio: aspect,
      style_type: "REALISTIC",
      magic_prompt_option: "AUTO",
    })
    return res.json({ imageUrl })
  } catch (err) {
    console.error("Ideogram error:", err)
    return res.status(500).json({ error: "Image generation failed", detail: err.message })
  }
})

// Nano Banana 2 — fast, Google model
router.post("/generate-image/nano-banana", async (req, res) => {
  const { prompt, platform } = req.body
  if (!prompt || !platform) return res.status(400).json({ error: "Missing prompt or platform" })

  const { aspect } = PLATFORM_SIZES[platform] || PLATFORM_SIZES.instagram

  try {
    const imageUrl = await runModel("google/imagen-3-fast", {
      prompt: enhancePrompt(prompt, platform, "nano-banana"),
      aspect_ratio: aspect,
    })
    return res.json({ imageUrl })
  } catch (err) {
    console.error("Nano Banana 2 error:", err)
    return res.status(500).json({ error: "Image generation failed", detail: err.message })
  }
})

// Nano Banana Pro — high quality, Google model
router.post("/generate-image/nano-banana-pro", async (req, res) => {
  const { prompt, platform } = req.body
  if (!prompt || !platform) return res.status(400).json({ error: "Missing prompt or platform" })

  const { aspect } = PLATFORM_SIZES[platform] || PLATFORM_SIZES.instagram

  try {
    const imageUrl = await runModel("google/imagen-3", {
      prompt: enhancePrompt(prompt, platform, "nano-banana-pro"),
      aspect_ratio: aspect,
    })
    return res.json({ imageUrl })
  } catch (err) {
    console.error("Nano Banana Pro error:", err)
    return res.status(500).json({ error: "Image generation failed", detail: err.message })
  }
})

module.exports = router
