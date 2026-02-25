import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../api/axios"

interface Task {
  _id: string
  title: string
  description: string
  status: string
}

interface Project {
  _id: string
  title: string
  description: string
  status: string
  tasks?: Task[]
}

export default function ProjectDetails() {
  const { id } = useParams() // pega o ID da URL
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem("token")
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      navigate("/")
      return
    }

    async function fetchProject() {
      try {
        const res = await api.get(`/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const projectData: Project = res.data

        // Buscar tarefas do projeto
        const tasksRes = await api.get(`/tasks/project/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setProject({ ...projectData, tasks: tasksRes.data })
      } catch (err: any) {
        console.error(err)
        alert(err.response?.data?.message || "Erro ao carregar projeto")
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id, token, navigate])

  if (loading) return <p>Carregando...</p>
  if (!project) return <p>Projeto não encontrado</p>

  return (
    <div>
      <h1>{project.title} ({project.status})</h1>
      <p>{project.description}</p>

      <h2>Tarefas:</h2>
      <ul>
        {project.tasks?.map((task) => (
          <li key={task._id}>
            <strong>{task.title}</strong> ({task.status}) - {task.description}
          </li>
        ))}
      </ul>
      <button onClick={() => navigate("/dashboard")}>Voltar para Dashboard</button>
      <button onClick={() => navigate("/projects")}>Ver projetos</button>
    </div>
  )
}