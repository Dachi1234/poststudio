const express = require("express")
const router  = express.Router()
const sharp   = require("sharp")
const { getBrowser }        = require("../utils/browser")
const { buildTemplateHTML } = require("../utils/buildTemplateHTML")

const PLATFORM_SIZES = {
  instagram: { width: 1080, height: 1080 },
  linkedin:  { width: 1200, height: 627  },
  facebook:  { width: 1200, height: 630  },
}

router.post("/export-template", async (req, res) => {
  const { templateId, post, platform, colorTheme, format = "png" } = req.body

  if (!templateId || !post || !platform) {
    return res.status(400).json({ error: "Missing required fields: templateId, post, platform" })
  }

  const { width, height } = PLATFORM_SIZES[platform] || PLATFORM_SIZES.instagram
  let page = null

  try {
    const browser = await getBrowser()
    page = await browser.newPage()

    await page.setViewport({ width, height, deviceScaleFactor: 2 })

    const html = buildTemplateHTML(templateId, post, colorTheme || "coral", width, height)

    await page.setContent(html, { waitUntil: "networkidle2", timeout: 20000 })

    // Let fonts settle after network idle
    await new Promise(r => setTimeout(r, 800))

    const screenshotBuffer = await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width, height },
      omitBackground: false,
    })

    if (format === "jpeg" || format === "jpg") {
      const jpegBuffer = await sharp(screenshotBuffer)
        .jpeg({ quality: 95, mozjpeg: true })
        .toBuffer()

      res.set({
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="codeless-post.jpg"`,
        "Content-Length": jpegBuffer.length,
        "Cache-Control": "no-cache",
      })
      return res.send(jpegBuffer)
    }

    const finalBuffer = await sharp(screenshotBuffer)
      .resize(width, height, { fit: "cover" })
      .png({ compressionLevel: 6 })
      .toBuffer()

    res.set({
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="codeless-post.png"`,
      "Content-Length": finalBuffer.length,
      "Cache-Control": "no-cache",
    })
    return res.send(finalBuffer)

  } catch (err) {
    console.error("Export template error:", err)
    return res.status(500).json({ error: "Export failed", detail: err.message })
  } finally {
    if (page) {
      try { await page.close() } catch (_) {}
    }
  }
})

module.exports = router
