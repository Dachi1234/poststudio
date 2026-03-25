/**
 * Simple API key middleware for backend routes.
 *
 * The frontend Next.js API routes (which already validate the user session)
 * should forward requests to the backend with this key in the Authorization header.
 *
 * Set BACKEND_API_KEY in .env on both frontend and backend.
 * If BACKEND_API_KEY is not set, the middleware is permissive (dev mode).
 */
function requireApiKey(req, res, next) {
  const expected = process.env.BACKEND_API_KEY
  if (!expected) return next() // dev mode — no key required

  const header = req.headers.authorization
  if (!header || header !== `Bearer ${expected}`) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  next()
}

module.exports = { requireApiKey }
