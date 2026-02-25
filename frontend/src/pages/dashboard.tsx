import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

interface Project {
  _id: string;
  title: string;
  description: string;
  status: string;
  tasksCount?: number;
}

function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token"); // remove token do usuário
    navigate("/"); // volta para a tela de login
  };

  useEffect(() => {
    async function fetchProjects() {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        // 1️⃣ Buscar todos os projetos
        const projectsRes = await api.get("/projects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const projectsData: Project[] = projectsRes.data;

        // 2️⃣ Para cada projeto, buscar tarefas e contar
        const projectsWithTasks = await Promise.all(
          projectsData.map(async (project) => {
            const tasksRes = await api.get(`/tasks/project/${project._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            return {
              ...project,
              tasksCount: tasksRes.data.length,
            };
          }),
        );

        setProjects(projectsWithTasks);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || "Erro ao carregar projetos");
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [navigate]);

  return (
    <div>
      <h1>ProTsK - Dashboard</h1>
      <div style={{ marginBottom: "1rem", textAlign: "right" }}>
        <button onClick={handleLogout}>Deslogar</button>
      </div>

      {loading && <p>Carregando projetos...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && projects.length === 0 && (
        <p>Nenhum projeto encontrado.</p>
      )}

      {!loading && !error && projects.length > 0 && (
        <ul>
          {projects.map((project) => (
            <li key={project._id}>
              <strong>{project.title}</strong> ({project.status}) -{" "}
              {project.tasksCount}{" "}
              {project.tasksCount === 1 ? "tarefa" : "tarefas"}
              <button onClick={() => navigate(`/projects/${project._id}`)}>
                Ver Projeto
              </button>
            </li>
          ))}
        </ul>
      )}

      <button onClick={() => navigate("/projects")}>
        Ver todos os projetos
      </button>
    </div>
  );
}

export default Dashboard;
