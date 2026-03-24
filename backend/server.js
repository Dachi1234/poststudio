require("dotenv").config()
const express = require("express")
const cors = require("cors")

const exportTemplateRouter = require("./routes/exportTemplate")
const generateCopyRouter   = require("./routes/generateCopy")
const generateImageRouter  = require("./routes/generateImage")

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

app.use("/api", exportTemplateRouter)
app.use("/api", generateCopyRouter)
app.use("/api", generateImageRouter)

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
