import { Router } from "express"
import { authMiddleware } from "../middlewares/auth.middleware"
import { createTask, getTasksByProject, searchTasks, updateTask, updateTaskStatus, deleteTask } from "../controllers/task.controller"

const router = Router()

router.get("/search", authMiddleware, searchTasks)
router.get("/project/:projectId", authMiddleware, getTasksByProject)
router.get("/me", authMiddleware, (req: any, res) => {
  res.json({ userId: req.userId })
})

router.put("/:taskId", authMiddleware, updateTask)
router.patch("/:taskId/status", authMiddleware, updateTaskStatus)
router.delete("/:taskId", authMiddleware, deleteTask)

export default router