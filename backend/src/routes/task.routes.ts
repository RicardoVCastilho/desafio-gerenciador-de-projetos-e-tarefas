import { Router } from "express"
import { authMiddleware } from "../middlewares/auth.middleware"
import { createTask, getTasksByProject, searchTasks, updateTask, updateTaskStatus, deleteTask } from "../controllers/task.controller"

const router = Router()

router.post("/", authMiddleware, createTask)
router.get("/project/:projectId", authMiddleware, getTasksByProject)
router.get("/search", authMiddleware, searchTasks)
router.put("/:taskId", authMiddleware, updateTask)
router.patch("/:taskId/status", authMiddleware, updateTaskStatus)
router.delete("/:taskId", authMiddleware, deleteTask)

export default router