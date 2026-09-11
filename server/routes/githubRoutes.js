import express from "express"
import { contributionsController } from "../controllers/githubController.js"

const router = express.Router()

router.post("/contributions",contributionsController)

export default router