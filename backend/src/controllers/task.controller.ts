import { Request, Response } from "express"
import { Task } from "../models/Task"
import { TaskStatus } from "../types/task.status"
import { Project } from "../models/Project"

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, projectId, status } = req.body as {
      title: string
      description?: string
      projectId: string
      status?: TaskStatus
    }

    const task = await Task.create({
      title,
      description,
      status,
      project: projectId,
      user: req.userId,
    })

    res.status(201).json({ message:"Tarefa criada com sucesso", task })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro ao criar tarefa" })
  }
}

export const getTasksByProject = async (req: Request, res: Response) => {
    try{
        const { projectId } = req.params

        const tasks = await Task.find({
            project: projectId,
            user: req.userId,
        })

        res.json(tasks)
    } catch(error) {
        console.log(error)
        res.status(500).json({message: "Erro ao buscar as tarefas."})
    }
}