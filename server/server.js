import express from "express"
import githubRouter from "./routes/githubRoutes.js"
import { githubRateLimiter } from "./middleware/rateLimiter.js"

const app = express()

const PORT = process.env.PORT || 5000

app.set("trust proxy", 1)
app.use(express.json())

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})

app.use("/api/github", githubRateLimiter, githubRouter)

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started running on port ${PORT}`)
})
