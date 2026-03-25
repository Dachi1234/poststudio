require("dotenv").config({ override: true })
const express = require("express")
const cors = require("cors")

const rateLimit              = require("express-rate-limit")
const { requireApiKey }     = require("./middleware/auth")

// Rate limiters — per IP
const generateLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 10,               // 10 requests per minute
  message: { error: "Too many requests — please wait a moment" },
})

const imageLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 15,               // 15 image requests per minute
  message: { error: "Too many image requests — please wait a moment" },
})
const exportTemplateRouter = require("./routes/exportTemplate")
const generateCopyRouter   = require("./routes/generateCopy")
const generateImageRouter  = require("./routes/generateImage")
const analyzeBrandRouter   = require("./routes/analyzeBrand")

const app  = express()
const PORT = process.env.PORT || 8080

app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "poststudio-backend", timestamp: new Date().toISOString() })
})

app.use("/api", requireApiKey, exportTemplateRouter)
app.use("/api", requireApiKey, generateLimiter, generateCopyRouter)
app.use("/api", requireApiKey, imageLimiter, generateImageRouter)
app.use("/api", requireApiKey, generateLimiter, analyzeBrandRouter)

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" })
})

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err)
  res.status(500).json({ error: "Internal server error", detail: err.message })
})

app.listen(PORT, () => {
  console.log(`PostStudio backend running on port ${PORT}`)
})

module.exports = app
