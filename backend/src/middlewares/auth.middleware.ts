import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

interface AuthRequest extends Request {
  userId?: string
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ message: "Nenhum token fornecido." })
  }

  const parts = authHeader.split(" ")

  if (parts.length !== 2) {
    return res.status(401).json({ message: "Formato de token inválido." })
  }

  const [scheme, token] = parts

  if (scheme !== "Bearer") {
    return res.status(401).json({ message: "Formato inválido." })
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: string }

    req.userId = decoded.id

    next()
  } catch {
    return res.status(401).json({ message: "Token inválido ou expirado." })
  }
}