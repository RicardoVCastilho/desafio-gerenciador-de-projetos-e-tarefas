import { Request, Response} from "express"
import { Project } from "../models/Project"

interface AuthRequest extends Request {
    userId?: string
}

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description } = req.body

    const project = await Project.create({
      title,
      description,
      user: req.userId,
    })

    res.status(201).json(project)
  } catch (error) {
    console.log("ERRO CREATE PROJECT:", error)
    res.status(500).json({ message: "Erro ao criar o projeto." })
  }
}

export const getProjects = async (req: AuthRequest, res: Response) => {
    try {
        const projects = await Project.find({ user: req.userId})

        res.json(projects)
    } catch(error) {
        res.status(500).json({message: "Erro ao buscar projetos."})
    }
}

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const project = await Project.findOne({
      _id: id,
      user: req.userId,
    })

    if (!project) {
      return res.status(404).json({ message: "Projeto não encontrado" })
    }

    res.json(project)
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar projeto" })
  }
}

export const updateProject = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params
        const { title, description } = req.body

        const project = await Project.findOneAndUpdate(
            {
                _id:id,
                user: req.userId,
            },
            {
                title,
                description,
            },
            { new: true}
        )

        if(!project) {
            return res.status(404).json({ message: "Projeto não encontrado."})
        }

        res.json(project)
    } catch(error) {
        res.status(500).json({ message: "Erro ao atualizar o projeto."})
    }
}

export const deleteProjects = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params

        await Project.findOneAndDelete({
            _id: id,
            user: req.userId,
        })

        res.json({ message: "Projeto removido."})
    } catch (error) {
        res.status(500).json({ message: "Erro ao remover o projeto."})
    }
}