const WINDOW_MS = 15 * 60 * 1000
const MAX_REQUESTS = 60

const clients = new Map()

const getClientKey = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"]

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim()
  }

  return req.ip || req.socket.remoteAddress || "unknown"
}

export const githubRateLimiter = (req, res, next) => {
  const now = Date.now()
  const clientKey = getClientKey(req)

  let entry = clients.get(clientKey)

  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS }
    clients.set(clientKey, entry)
  }

  entry.count += 1

  const remaining = Math.max(0, MAX_REQUESTS - entry.count)
  const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000)

  res.setHeader("X-RateLimit-Limit", MAX_REQUESTS)
  res.setHeader("X-RateLimit-Remaining", remaining)
  res.setHeader("X-RateLimit-Reset", Math.ceil(entry.resetAt / 1000))

  if (entry.count > MAX_REQUESTS) {
    res.setHeader("Retry-After", retryAfterSeconds)

    return res.status(429).json({
      error: "Too many requests. Please try again later.",
    })
  }

  next()
}
