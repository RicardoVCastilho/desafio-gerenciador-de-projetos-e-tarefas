import { Request, Response } from "express";
import { Project } from "../models/Project";
import { Task } from "../models/Task";
import mongoose from "mongoose";

interface AuthRequest extends Request {
  userId?: string;
}

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description } = req.body;

    const project = await Project.create({
      title,
      description,
      user: req.userId,
    });

    res.status(201).json(project);
  } catch (error) {
    console.log("ERRO CREATE PROJECT:", error);
    res.status(500).json({ message: "Erro ao criar o projeto." });
  }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const projects = await Project.find({ user: req.userId });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar projetos." });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const project = await Project.findOne({
      _id: id,
      user: req.userId,
    });

    if (!project) {
      return res.status(404).json({ message: "Projeto não encontrado" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar projeto" });
  }
};

export const getProjectsByStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;

    const filter: any = {
      user: req.userId,
    };

    if (status) {
      filter.status = status;
    }

    const projects = await Project.find(filter);

    res.json(projects);
  } catch (error) {
    res.status(500).json({
      message: "Erro ao buscar projetos.",
    });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    // 1️⃣ Buscar projeto
    const project = await Project.findOne({
      _id: id,
      user: req.userId,
    });

    if (!project) {
      return res.status(404).json({
        message: "Projeto não encontrado.",
      });
    }

    // 2️⃣ Validar se está concluído
    if (project.status === "concluido") {
      return res.status(400).json({
        message: "Não é possível editar um projeto concluído.",
      });
    }

    // 3️⃣ Atualizar campos permitidos
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;

    await project.save();

    return res.json(project);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao atualizar o projeto.",
    });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    // 🔹 Usa o nome correto do parâmetro da rota
    const { id: projectIdRaw } = req.params;

    const projectId = Array.isArray(projectIdRaw)
      ? projectIdRaw[0]
      : projectIdRaw;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "ID do projeto inválido." });
    }

    const userId = new mongoose.Types.ObjectId(req.userId);

    const project = await Project.findOneAndDelete({
      _id: projectId,
      user: userId,
    });

    if (!project) {
      return res.status(404).json({ message: "Projeto não encontrado." });
    }

    await Task.deleteMany({ project: project._id });

    res.json({ message: "Projeto e tarefas removidos com sucesso." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erro ao deletar projeto." });
  }
};

export const completeProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await Project.findOne({
      _id: id,
      user: req.userId,
    });

    if (!project) {
      return res.status(404).json({ message: "Projeto não encontrado." });
    }

    if (project.status === "concluido") {
      return res.status(400).json({ message: "Projeto já está concluído." });
    }

    project.status = "concluido";
    await project.save();

    res.json({ message: "Projeto concluído com sucesso.", project });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erro ao concluir projeto." });
  }
};
