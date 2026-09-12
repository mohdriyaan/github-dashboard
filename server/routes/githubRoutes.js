import express from "express"
import { contributionsController, profileController, reposController } from "../controllers/githubController.js"

const router = express.Router()

router.post("/contributions",contributionsController)
router.post("/profile", profileController)
router.post("/repos", reposController)

export default router