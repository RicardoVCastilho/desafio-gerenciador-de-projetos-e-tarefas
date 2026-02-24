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
        .populate("project", "title")
        .sort({ created: -1 })

        res.json(tasks)
    } catch(error) {
        console.log(error)
        res.status(500).json({message: "Erro ao buscar as tarefas."})
    }
}

export const searchTasks = async (req: Request, res: Response) => {
  try {
    const { query } = req.query

    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "Uma consulta é obrigatória."})
    }

    const projects = await Project.find({
      title: { $regex: query, $options: "i"},
      user: req.userId,
    })

    const projectIds = projects.map((p) => p._id)

    const tasks = await Task.find({
      user: req.userId,
      $or: [
        { title: {$regex: query, $options: "i"} },
        { description: {$regex: query, $options: "i"} },
        { project: {$in: projectIds} },
      ],
    })
    .populate("project", "title")
    .sort({ createdAt: -1})

    res.json(tasks)
  } catch(error) {
    console.log(error)
    res.status(500).json({ message: "Erro ao realizar a busca."})
  }
}

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params
    const { title, description } = req.body

    const task = await Task.findOne({
      _id: taskId,
      user: req.userId,
    })

    if(!task) {
      return res.status(404).json({ message: "Tarefa não encontrada."})
    }

    if (title !== undefined) task.title = title
    if(description !== undefined) task.description = description

    await task.save()

    res.json(task)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro ao atualizar a tarefa."})
  }
}

export const updateTaskStatus = async ( req: Request, res: Response) => {
  try {
    const { taskId } = req.params
    const { status } = req.body

    const allowedStatus = ["a_fazer", "em_progresso", "feito"]

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Status Inválido."})
    }

    const task = await Task.findOne({
      _id: taskId,
      user: req.userId,
    })

    if (!task) {
      return res.status(404).json({ message: "Tarefa não encontrada."})
    }

    task.status = status
    await task.save()

    res.json(task)
  } catch(error) {
    console.log(error)
    res.status(500).json({ message: "Erro ao atualizar o status."})
}
}

export const deleteTask = async ( req: Request, res: Response) => {
  try {
    const { taskId } = req.params

    const task = await Task.findOneAndDelete({
      _id: taskId,
      user: req.userId,
    })

    if(!task) {
      return res.status(404).json({ message: "Tarefa não encontrada."})
    }

    res.json({ message: "Tarefa removida com sucesso."})
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erro ao deletar a tarefa."})
  }
}
