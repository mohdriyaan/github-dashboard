import express from "express"
import path from "node:path"
import { fileURLToPath } from "node:url"

import githubRouter from "./routes/githubRoutes.js"
import { githubRateLimiter } from "./middleware/rateLimiter.js"

const app = express()

const PORT = process.env.PORT || 5000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const clientDistPath = path.join(__dirname, "../client/dist")

app.set("trust proxy", 1)

app.use(express.json())

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})

app.use("/api/github", githubRateLimiter, githubRouter)

app.use(express.static(clientDistPath))

app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"))
})

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started running on port ${PORT}`)
})