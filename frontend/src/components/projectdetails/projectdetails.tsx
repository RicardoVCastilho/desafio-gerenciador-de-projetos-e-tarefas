import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "../projectdetails/projectdetails.css"

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  status: string;
  tasks?: Task[];
}

function normalizeStatus(s?: string) {
  const v = String(s || "").toLowerCase();
  if (v.includes("concl")) return "concluido";
  if (v.includes("ativ")) return "ativo";
  if (v.includes("pend")) return "pendente";
  if (v.includes("and")) return "andamento";
  return v || "indefinido";
}

function statusLabel(s?: string) {
  const v = normalizeStatus(s);
  if (v === "concluido") return "Concluído";
  if (v === "ativo") return "Ativo";
  if (v === "pendente") return "Pendente";
  if (v === "andamento") return "Em andamento";
  return s || "Indefinido";
}

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    async function fetchProject() {
      try {
        const res = await api.get(`/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const projectData: Project = res.data;

        const tasksRes = await api.get(`/tasks/project/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProject({ ...projectData, tasks: tasksRes.data });
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.message || "Erro ao carregar projeto");
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [id, token, navigate]);

  const stats = useMemo(() => {
    const tasks = project?.tasks || [];
    const total = tasks.length;
    const done = tasks.filter((t) => normalizeStatus(t.status) === "concluido").length;
    const pending = total - done;
    return { total, done, pending };
  }, [project]);

  if (loading) {
    return (
      <div className="pd-shell">
        <div className="pd-container">
          <div className="pd-skeleton-title" />
          <div className="pd-skeleton-card" />
          <div className="pd-skeleton-card" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="pd-shell">
        <div className="pd-container">
          <div className="pd-empty">
            <h2>Projeto não encontrado</h2>
            <p>Verifique se o link está correto ou volte para o dashboard.</p>
            <button className="pd-btn" onClick={() => navigate("/dashboard")}>
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const projStatus = normalizeStatus(project.status);

  return (
    <div className="pd-shell">
      <div className="pd-container">
        {/* Header */}
        <header className="pd-header">
          <button className="pd-btn pd-btn-ghost" onClick={() => navigate(-1)}>
            ← Voltar
          </button>

          <div className="pd-header-main">
            <h1 className="pd-title">{project.title}</h1>
            <span className={`pd-badge pd-badge-${projStatus}`}>
              {statusLabel(project.status)}
            </span>
          </div>

          <div className="pd-header-actions">
            <button className="pd-btn pd-btn-secondary" onClick={() => navigate("/projects")}>
              Ver projetos
            </button>
          </div>
        </header>

        <section className="pd-grid">
          <article className="pd-card">
            <h3 className="pd-card-title">Descrição</h3>
            <p className="pd-text">
              {project.description?.trim() ? project.description : "Sem descrição."}
            </p>
          </article>

          <article className="pd-card">
            <h3 className="pd-card-title">Resumo</h3>
            <div className="pd-stats">
              <div className="pd-stat">
                <span className="pd-stat-label">Total</span>
                <span className="pd-stat-value">{stats.total}</span>
              </div>
              <div className="pd-stat">
                <span className="pd-stat-label">Concluídas</span>
                <span className="pd-stat-value">{stats.done}</span>
              </div>
              <div className="pd-stat">
                <span className="pd-stat-label">Pendentes</span>
                <span className="pd-stat-value">{stats.pending}</span>
              </div>
            </div>
          </article>
        </section>

        <section className="pd-card">
          <div className="pd-card-head">
            <h3 className="pd-card-title">Tarefas</h3>
            <span className="pd-muted">
              {stats.total} {stats.total === 1 ? "tarefa" : "tarefas"}
            </span>
          </div>

          {project.tasks?.length ? (
            <div className="pd-tasks">
              {project.tasks.map((task) => {
                const tStatus = normalizeStatus(task.status);
                return (
                  <div key={task._id} className="pd-task">
                    <div className="pd-task-main">
                      <div className="pd-task-top">
                        <strong className="pd-task-title">{task.title}</strong>
                        <span className={`pd-badge pd-badge-${tStatus}`}>
                          {statusLabel(task.status)}
                        </span>
                      </div>
                      <p className="pd-task-desc">
                        {task.description?.trim() ? task.description : "Sem descrição."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="pd-empty-inline">
              <p>Nenhuma tarefa cadastrada neste projeto.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}