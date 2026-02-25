import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

import "./ProjectDetails.css";
import "./projectDetailsModal.css";

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
  if (v.includes("prog")) return "andamento";
  if (v.includes("feito")) return "concluido";
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

type Props = {
  projectId: string;
  onClose: () => void;
};

export default function ProjectDetailsModal({ projectId, onClose }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    if (!token) return;

    async function fetchProject() {
      try {
        setLoading(true);

        const res = await api.get(`/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const tasksRes = await api.get(`/tasks/project/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProject({ ...res.data, tasks: tasksRes.data });
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.message || "Erro ao carregar projeto");
        onClose();
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [projectId, token, onClose]);

  const stats = useMemo(() => {
    const tasks = project?.tasks || [];
    const total = tasks.length;
    const done = tasks.filter(
      (t) => normalizeStatus(t.status) === "concluido",
    ).length;
    const pending = total - done;
    return { total, done, pending };
  }, [project]);

  const goProjects = () => {
    onClose();
    navigate("/projects");
  };

  return (
    <div className="pdm-overlay" onMouseDown={onClose}>
      <div className="pdm-dialog" onMouseDown={(e) => e.stopPropagation()}>
        <button className="pdm-close" onClick={onClose} aria-label="Fechar">
          ✕
        </button>

        <div className="pdm-scroll">
          <div className="pd-shell pd-shell-modal">
            <div className="pd-container">
              {loading && (
                <>
                  <div className="pd-skeleton-title" />
                  <div className="pd-skeleton-card" />
                  <div className="pd-skeleton-card" />
                </>
              )}

              {!loading && project && (
                <>
                  <header className="pd-header">
                    <button className="pd-btn pd-btn-ghost" onClick={onClose}>
                      ← Fechar
                    </button>

                    <div className="pd-header-main">
                      <h1 className="pd-title">{project.title}</h1>
                      <span
                        className={`pd-badge pd-badge-${normalizeStatus(project.status)}`}
                      >
                        {statusLabel(project.status)}
                      </span>
                    </div>

                    <div className="pd-header-actions">
                      <button
                        className="pd-btn pd-btn-secondary"
                        onClick={goProjects}
                      >
                        Ver projetos
                      </button>
                    </div>
                  </header>

                  <section className="pd-grid">
                    <article className="pd-card">
                      <h3 className="pd-card-title">Descrição</h3>
                      <p className="pd-text">
                        {project.description?.trim()
                          ? project.description
                          : "Sem descrição."}
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
                              <div className="pd-task-top">
                                <strong className="pd-task-title">
                                  {task.title}
                                </strong>
                                <span
                                  className={`pd-badge pd-badge-${tStatus}`}
                                >
                                  {statusLabel(task.status)}
                                </span>
                              </div>
                              <p className="pd-task-desc">
                                {task.description?.trim()
                                  ? task.description
                                  : "Sem descrição."}
                              </p>
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
                </>
              )}

              {!loading && !project && (
                <div className="pd-empty-inline">
                  <p>Projeto não encontrado.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
