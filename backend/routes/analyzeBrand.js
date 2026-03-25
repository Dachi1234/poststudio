const express = require("express")
const router = express.Router()
const Anthropic = require("@anthropic-ai/sdk")

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

router.post("/analyze-brand", async (req, res) => {
  const { url } = req.body
  if (!url) return res.status(400).json({ error: "URL required" })

  try {
    // Fetch the website HTML
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    let html = ""
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; PostStudio/1.0)" },
      })
      html = await response.text()
      clearTimeout(timeout)
    } catch {
      clearTimeout(timeout)
      html = "" // Will still attempt Claude with empty context
    }

    // Strip excessive HTML, keep first 6000 chars
    const stripped = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 6000)

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      system: `You are a brand analyst. Extract brand information from a website's text content.
Return ONLY a valid JSON object with these keys (all optional except name):
{
  "name": "Brand name",
  "tagline": "Short tagline or slogan",
  "description": "1-2 sentence business description",
  "audience": "Target audience description",
  "toneOfVoice": "One of: Professional, Friendly, Bold, Playful, Minimalist, Luxury, Educational",
  "primaryColor": "#hexcolor (if you can infer from brand)"
}
Return ONLY the JSON, no markdown, no explanation.`,
      messages: [
        {
          role: "user",
          content: `Website URL: ${url}\n\nWebsite content:\n${stripped || "Content unavailable — infer from URL only."}`,
        },
      ],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : "{}"

    let brandData = {}
    try {
      // Extract JSON from response
      const match = text.match(/\{[\s\S]*\}/)
      brandData = match ? JSON.parse(match[0]) : {}
    } catch {
      brandData = {}
    }

    return res.json(brandData)
  } catch (err) {
    console.error("[analyze-brand]", err)
    return res.status(500).json({ error: "Analysis failed" })
  }
})

module.exports = router
