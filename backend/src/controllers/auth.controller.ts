import { Request, Response} from "express"
import bcrypt from "bcryptjs"
import jwt  from "jsonwebtoken"
import User from "../models/User"

export const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body

    const userExists = await User.findOne({ email })
    if(userExists) {
        return res.status(400).json({message: "Este usuário já existe"})
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
        name,
        email,
        password: hashedPassword
    })

    return res.status(201).json({message: "Usuário criado com sucesso!"})
}

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body

    const user = await User.findOne({email})
    if(!user) {
        return res.status(400).json({ message: "Credenciais inválidas" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) {
        return res.status(400).json({ message: "Credenciais inválidas"})
    }

    const token = jwt.sign(
        { id: user._id},
        process.env.JWT_SECRET!,
        { expiresIn: "1d"}
    )

    return res.json({ token })
}