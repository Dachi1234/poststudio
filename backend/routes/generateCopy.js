const express   = require("express")
const router    = express.Router()
const Anthropic = require("@anthropic-ai/sdk")

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

router.post("/generate-copy", async (req, res) => {
  const { platform, goal, prompt, toneOverride, variations } = req.body

  if (!platform || !goal || !prompt) {
    return res.status(400).json({ error: "Missing required fields: platform, goal, prompt" })
  }

  const platformSizes = {
    instagram: "1080x1080 square",
    linkedin:  "1200x627 landscape",
    facebook:  "1200x630 landscape",
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: `You are a social media copywriter for CodeLess — a Georgian IT education brand 
that teaches career-changers to become project managers without coding.

Brand voice: approachable, clear, confident, subtly playful. Warm like a mentor, never corporate.
Direct, human, and encouraging.

Words you NEVER use: revolutionary, game-changing, disruptive, leverage, synergy, 
cutting-edge, enterprise-grade, thrilled to announce.

Write posts that feel like they come from a real person who genuinely wants to help 
people enter tech. Focus on real outcomes, not theory. Respect the reader's intelligence.`,

      messages: [{
        role: "user",
        content: `Platform: ${platform} (${platformSizes[platform] || "unknown"})
Post goal: ${goal}
Brief: ${prompt}
Tone: ${toneOverride || "CodeLess default — warm mentor voice"}
Variations: ${variations || 2}

Brand colors for image prompts: Coral #FD8D6E, Blue #5A8DEE, Dark Gray #2E2E2E
Visual style: warm natural lighting, people collaborating, Georgian context.

Generate ${variations || 2} post variation(s).

Respond ONLY with valid JSON. No markdown. No explanation. No code fences:
{
  "posts": [
    {
      "id": "1",
      "headline": "Max 8 words. Punchy and specific.",
      "caption": "2-4 sentences. Authentic, warm, outcome-focused.",
      "hashtags": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"],
      "cta": "Max 6 words.",
      "imagePrompt": "Detailed visual scene for AI image generation. Include: subject, mood, warm natural lighting, coral #FD8D6E and blue #5A8DEE accents, Georgian context. No text in image."
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
