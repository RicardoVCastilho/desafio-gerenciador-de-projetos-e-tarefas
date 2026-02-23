import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.routes"
import projectRoutes from "./routes/project.routes"
import taskRoutes from "./routes/task.routes"


const app = express()

app.use(cors())
app.use(express.json())

app.use("/auth", authRoutes)
app.use("/projects", projectRoutes)
app.use("/tasks", taskRoutes)

app.get("/", (req, res) => {
  res.json({ message: "Sua API está funcionando perfeitamente!" })
})

export default app
