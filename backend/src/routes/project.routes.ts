import { Router } from "express"
import { authMiddleware } from "../middlewares/auth.middleware"
import { createProject, getProjects, getProjectById, updateProject, deleteProject } from "../controllers/project.controller"

const router = Router()

router.post("/", authMiddleware, createProject)
router.get("/", authMiddleware, getProjects)
router.get("/:id", authMiddleware, getProjectById)
router.put("/:id", authMiddleware, updateProject)
router.delete("/:id", authMiddleware, deleteProject)

export default router