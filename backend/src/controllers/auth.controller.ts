import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import User from "../models/User";
import { normalize } from "node:path";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Validação da versão 2.0 - Básica
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Nome, email e senha são obrigatórias.",
      });
    }

    // Validação da versão 2.0 - Senha com no mínimo 6 caracteres
    if (password.length < 6) {
      return res.status(400).json({
        message: "A senha deve ter no mínimo 6 caracteres.",
      });
    }

    //Validação da versão 2.0 - Normaliza o e-mail para minúsculo e utiliza a lib "validator" para conferir se é um e-mail que existe de fato
    const normalizedEmail = email.toLowerCase();

    if (!validator.isEmail(normalizedEmail)) {
      return res.status(400).json({ message: "E-mail inválido." });
    }

    // Velidação se o usuário já existe no banco
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

    // Validações 2.0 de campos obrigatórios
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "O email e a senha são obrigatórios." });
    }

    const normalizedEmail = email.toLowerCase();

    //Validação 2.0  de formato - usando a lib
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
