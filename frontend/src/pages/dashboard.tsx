import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Dashboard.css";

interface Project {
  _id: string;
  title: string;
  status: "ativo" | "concluido";
  tasksCount: number;
}

interface User {
  name: string;
  email: string;
}

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user] = useState<User | null>(
    storedUser ? JSON.parse(storedUser) : null
  );

  // Busca projetos
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data: Project[] = res.data.map((p: any) => ({
          _id: p._id,
          title: p.title,
          status: p.status,
          tasksCount: p.tasks?.length || 0,
        }));

        setProjects(data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || "Erro ao carregar projetos");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [navigate, token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <h1 className="sidebar-title">ProTsK Manager</h1>

        <nav className="sidebar-nav">
          <Link to="/projects" className="projects-link">
            Projetos
          </Link>
        </nav>

        {user && (
          <div className="sidebar-user">
            <p className="user-name">{user.name}</p>
            <p className="user-email">{user.email}</p>
          </div>
        )}

        <div className="sidebar-buttons">
          <button onClick={handleLogout}>Deslogar</button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="dashboard-main">
        <h2>Dashboard Principal</h2>

        {loading && <p>Carregando projetos...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && projects.length === 0 && (
          <p>Nenhum projeto encontrado.</p>
        )}

        <div className="projects-grid">
          {!loading &&
            !error &&
            projects.map((project) => (
              <div key={project._id} className="project-card">
                <h3>{project.title}</h3>
                <p>
                  Status: {project.status} <br />
                  {project.tasksCount}{" "}
                  {project.tasksCount === 1 ? "tarefa" : "tarefas"}
                </p>
                <button onClick={() => navigate(`/projects/${project._id}`)}>
                  Ver Projeto
                </button>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;