import { Router } from "express"
import { authMiddleware } from "../middlewares/auth.middleware"
import { createTask, getTasksByProject } from "../controllers/task.controller"

const router = Router()

router.post("/", authMiddleware, createTask)
router.get("/project/:projectId", authMiddleware, getTasksByProject)

export default router