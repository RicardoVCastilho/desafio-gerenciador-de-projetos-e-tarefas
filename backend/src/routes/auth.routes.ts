import { Router } from "express"
import { register, login } from "../controllers/auth.controller"
import { authMiddleware } from "../middlewares/auth.middleware"

const router = Router()

router.post("/register", register)
router.post("/login", login)

router.get("/me", authMiddleware, (req: any, res) => {
  res.json({ userId: req.userId })
})

export default router