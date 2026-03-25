const express   = require("express")
const router    = express.Router()
const Anthropic = require("@anthropic-ai/sdk")

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const DEFAULT_BRAND = {
  name:          "CodeLess",
  description:   "A Georgian IT education brand that teaches career-changers to become project managers without coding.",
  audience:      "Georgian career-changers looking to enter tech",
  toneOfVoice:   "Professional",
  primaryColor:  "#FD8D6E",
  accentColor:   "#5A8DEE",
  secondaryColor: "#2E2E2E",
}

router.post("/generate-copy", async (req, res) => {
  const { platform, goal, prompt, toneOverride, variations, brand } = req.body

  if (!platform || !goal || !prompt) {
    return res.status(400).json({ error: "Missing required fields: platform, goal, prompt" })
  }

  const b = { ...DEFAULT_BRAND, ...brand }

  const platformSizes = {
    instagram: "1080x1080 square",
    linkedin:  "1200x627 landscape",
    facebook:  "1200x630 landscape",
  }

  const toneMap = {
    Professional:  "professional, clear, authoritative but approachable",
    Friendly:      "warm, conversational, like talking to a knowledgeable friend",
    Bold:          "direct, confident, punchy, action-oriented",
    Playful:       "light-hearted, witty, engaging, slightly fun",
    Minimalist:    "concise, clean, no fluff, every word earns its place",
    Luxury:        "premium, refined, aspirational, exclusive feel",
    Educational:   "informative, helpful, mentor-like, teaching tone",
  }

  const brandTone = toneMap[b.toneOfVoice] || toneMap.Professional

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: `You are a social media copywriter for ${b.name}.

About the brand: ${b.description || "A professional brand."}
Target audience: ${b.audience || "General professional audience."}
Brand tone: ${brandTone}${toneOverride ? ` (user override: ${toneOverride})` : ""}

Words you NEVER use: revolutionary, game-changing, disruptive, leverage, synergy, 
cutting-edge, enterprise-grade, thrilled to announce.

Write posts that feel authentic and human. Focus on real outcomes, not abstract promises.
Respect the reader's intelligence.`,

      messages: [{
        role: "user",
        content: `Platform: ${platform} (${platformSizes[platform] || "unknown"})
Post goal: ${goal}
Brief: ${prompt}
Variations: ${variations || 2}

Brand colors for image prompts: Primary ${b.primaryColor}, Accent ${b.accentColor}, Background ${b.secondaryColor}

Generate ${variations || 2} post variation(s).

Respond ONLY with valid JSON. No markdown. No explanation. No code fences:
{
  "posts": [
    {
      "id": "1",
      "headline": "Max 8 words. Punchy and specific.",
      "caption": "2-4 sentences. Authentic, outcome-focused, brand-appropriate tone.",
      "hashtags": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"],
      "cta": "Max 6 words.",
      "imagePrompt": "Detailed visual scene for AI image generation. Include: subject, mood, lighting, brand color accents (${b.primaryColor} and ${b.accentColor}). No text overlays in image."
    }
  ]
}`,
      }],
    })

    const text  = message.content[0].text
    const clean = text.replace(/```json|```/g, "").trim()
    const parsed = JSON.parse(clean)
    return res.json(parsed)

  } catch (err) {
    console.error("Generate copy error:", err)
    return res.status(500).json({ error: "Copy generation failed", detail: err.message })
  }
})

module.exports = router
