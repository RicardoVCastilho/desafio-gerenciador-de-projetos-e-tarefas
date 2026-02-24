import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import User from "../models/User";
import { normalize } from "node:path";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Nome, email e senha são obrigatórias.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "A senha deve ter no mínimo 6 caracteres.",
      });
    }

    const normalizedEmail = email.toLowerCase();

    if (!validator.isEmail(normalizedEmail)) {
      return res.status(400).json({ message: "E-mail inválido." });
    }

    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({
        message: "Este usuário já foi cadastrado.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({ message: "Usuário criado com sucesso!" });
  } catch (error) {
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "O email e a senha são obrigatórios." });
    }

    const normalizedEmail = email.toLowerCase();

    if (!validator.isEmail(normalizedEmail)) {
      return res.status(400).json({ message: "E-mail inválido." });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ messsage: "Email ou senha incorretos." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Email ou senha incorretos." });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWTR_SECRET não definido.");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.json({message: "Usuário logado com sucesso", token });

  } catch (error) {
  console.error("ERRO LOGIN:", error);
  return res.status(500).json({ message: "Erro interno no servidor." });
}
};
