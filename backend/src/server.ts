import "dotenv/config"
import app from "./app"
import mongoose from "mongoose"

const PORT = 3000

mongoose.connect(process.env.MONGO_URL as string)
  .then(() => {
    console.log("Banco de dados conectado")

    app.listen(PORT, () => {
      console.log(` Servidor rodando na porta ${PORT}`)
    })
  })
  .catch((error) => {
    console.error("Erro ao conectar no Banco:", error)
  })