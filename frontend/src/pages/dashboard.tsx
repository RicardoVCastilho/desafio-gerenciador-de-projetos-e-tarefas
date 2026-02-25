// Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../api/axios";
import Sidebar from "../components/sideBar/sideBar";
import ProjectDetailsModal from "../components/projectDetails/projectDetailsmodal";
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

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const [user] = useState<User | null>(storedUser ? JSON.parse(storedUser) : null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleLogout = () => {
    try {
      if (isMobile) closeSidebar();

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      toast.info("Você saiu da sua conta com segurança.");
    } finally {
      navigate("/");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get("/projects", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const projectsData = (res.data || []) as any[];

        const projectsWithCount: Project[] = await Promise.all(
          projectsData.map(async (p: any) => {
            try {
              const tasksRes = await api.get(`/tasks/project/${p._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              const tasksCount = Array.isArray(tasksRes.data) ? tasksRes.data.length : 0;

              return {
                _id: p._id,
                title: p.title,
                status: p.status,
                tasksCount,
              } as Project;
            } catch {
              return {
                _id: p._id,
                title: p.title,
                status: p.status,
                tasksCount: 0,
              } as Project;
            }
          })
        );

        setProjects(projectsWithCount);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || "Erro ao carregar projetos");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [navigate, token]);

  const openProjectModal = (projectId: string) => {
    if (isMobile) closeSidebar();
    setSelectedProjectId(projectId);
  };

  return (
    <div className="dashboard-shell">
      {isMobile && (
        <header className="dashboard-topbar">
          <button className="topbar-menu-btn" onClick={toggleSidebar} aria-label="Abrir menu">
            ☰
          </button>

          <div className="topbar-title-wrap">
            <span className="topbar-title">Dashboard</span>
            {user?.name && <span className="topbar-subtitle">{user.name}</span>}
          </div>

          <div className="topbar-spacer" />
        </header>
      )}

      <div className="dashboard-container">
        <Sidebar
          user={user ?? undefined}
          onLogout={handleLogout}
          openSidebar={sidebarOpen}
          toggleSidebar={isMobile ? closeSidebar : undefined}
        />

        <main className="dashboard-main">
          <h2>Dashboard Principal</h2>
          <p>Aqui você confere um resumo dos projetos ativos e suas tarefas.</p>

          {loading && <p>Carregando projetos...</p>}
          {error && <p className="error-text">{error}</p>}

          {!loading && !error && projects.length === 0 && <p>Nenhum projeto encontrado.</p>}

          <div className="projects-grid">
            {!loading &&
              !error &&
              projects.map((project) => (
                <div key={project._id} className="project-card">
                  <h3>{project.title}</h3>
                  <p>
                    Status: {project.status} <br />
                    {project.tasksCount} {project.tasksCount === 1 ? "tarefa" : "tarefas"}
                  </p>

                  <button onClick={() => openProjectModal(project._id)}>Ver Projeto</button>
                </div>
              ))}
          </div>
        </main>
      </div>

      {selectedProjectId && (
        <ProjectDetailsModal projectId={selectedProjectId} onClose={() => setSelectedProjectId(null)} />
      )}
    </div>
  );
}

export default Dashboard;