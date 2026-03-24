// In Docker (Cloud Run): PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium is set,
// so we use puppeteer-core with that path.
// Locally on Windows/Mac: no env var → use full puppeteer with its bundled Chromium.
const puppeteer = require("puppeteer")

let browserInstance = null

async function getBrowser() {
  if (browserInstance && browserInstance.connected) {
    return browserInstance
  }

  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined

  console.log("Launching Puppeteer browser" + (executablePath ? ` at ${executablePath}` : " (bundled Chromium)") + "…")

  browserInstance = await puppeteer.launch({
    ...(executablePath ? { executablePath } : {}),
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
      "--no-zygote",
      "--disable-extensions",
    ],
  })

  browserInstance.on("disconnected", () => {
    console.log("Browser disconnected — will relaunch on next request")
    browserInstance = null
  })

  console.log("Browser ready")
  return browserInstance
}

async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close()
    browserInstance = null
  }
}

module.exports = { getBrowser, closeBrowser }
