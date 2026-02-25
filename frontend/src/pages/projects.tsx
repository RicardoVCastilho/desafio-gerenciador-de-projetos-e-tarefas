// Projects.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../api/axios";
import Sidebar from "../components/sideBar/sideBar";
import "./projects.css";
import EditProjectModal from "../components/editProjectModal/editProjectModal";
import type { ProjectForEdit } from "../components/editProjectModal/editProjectModal";
import "../components/editProjectModal/editProjectModal.css";
import EditTaskModal from "../components/editTaskModal/editTaskModal";
import type { TaskForEdit } from "../components/editTaskModal/editTaskModal";
import "../components/editTaskModal/editTaskModal.css";
import ConfirmDialog from "../components/ui/confirm/confirmDialog";
import "../components/ui/confirm/confirmDialog.css";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: "a_fazer" | "em_progresso" | "feito";
}

interface Project {
  _id: string;
  title: string;
  description: string;
  status: "ativo" | "concluido";
  tasks?: Task[];
}

interface User {
  name: string;
  email: string;
}

function Projects() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const [user] = useState<User | null>(
    storedUser ? JSON.parse(storedUser) : null,
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const [editingProject, setEditingProject] = useState<ProjectForEdit | null>(
    null,
  );
  const [editingTask, setEditingTask] = useState<{
    projectId: string;
    task: TaskForEdit;
  } | null>(null);
  const [projectFilter, setProjectFilter] = useState<
    "todos" | "ativo" | "concluido"
  >("todos");
  const [taskFilters, setTaskFilters] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDesc, setConfirmDesc] = useState("");
  const [confirmDanger, setConfirmDanger] = useState(true);
  const [confirmText, setConfirmText] = useState("Excluir");
  const [onConfirmAction, setOnConfirmAction] = useState<
    (() => Promise<void> | void) | null
  >(null);

  const openConfirm = (opts: {
    title: string;
    description: string;
    danger?: boolean;
    confirmText?: string;
    onConfirm: () => Promise<void> | void;
  }) => {
    setConfirmTitle(opts.title);
    setConfirmDesc(opts.description);
    setConfirmDanger(opts.danger ?? true);
    setConfirmText(
      opts.confirmText ?? ((opts.danger ?? true) ? "Excluir" : "Confirmar"),
    );
    setOnConfirmAction(() => opts.onConfirm);
    setConfirmOpen(true);
  };

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

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

        const projectsData: Project[] = res.data;

        const projectsWithTasks = await Promise.all(
          projectsData.map(async (project) => {
            const tasksRes = await api.get(`/tasks/project/${project._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            return { ...project, tasks: tasksRes.data };
          }),
        );

        setProjects(projectsWithTasks);
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
    try {
      if (isMobile) closeSidebar();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.info("Você saiu da sua conta com segurança.");
    } finally {
      navigate("/");
    }
  };

  const createProject = async (form: HTMLFormElement) => {
    const titleInput = form[0] as HTMLInputElement;
    const descInput = form[1] as HTMLInputElement;
    if (!titleInput.value || !descInput.value) return;

    try {
      const res = await api.post(
        "/projects",
        { title: titleInput.value, description: descInput.value },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setProjects((prev) => [...prev, { ...res.data, tasks: [] }]);
      titleInput.value = "";
      descInput.value = "";
      toast.success("Projeto criado com sucesso.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erro ao criar projeto");
    }
  };

  const requestDeleteProject = (projectId: string, title: string) => {
    openConfirm({
      title: "Excluir projeto?",
      description: `Tem certeza que deseja excluir "${title}"? Essa ação não pode ser desfeita.`,
      danger: true,
      confirmText: "Excluir",
      onConfirm: async () => {
        try {
          await api.delete(`/projects/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setProjects((prev) => prev.filter((p) => p._id !== projectId));
          toast.success("Projeto excluído com sucesso.");
        } catch (err: any) {
          console.error(err);
          toast.error(err.response?.data?.message || "Erro ao deletar projeto");
        } finally {
          setConfirmOpen(false);
        }
      },
    });
  };

  const completeProject = async (projectId: string) => {
    try {
      await api.patch(`/projects/${projectId}/complete`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProjects((prev) =>
        prev.map((p) => {
          if (p._id !== projectId) return p;
          return {
            ...p,
            status: "concluido",
            tasks: (p.tasks || []).map((t) => ({ ...t, status: "feito" })),
          };
        }),
      );

      toast.success("Projeto concluído! Tarefas marcadas como feitas.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erro ao concluir projeto");
    }
  };

  const updateProject = (project: Project) => setEditingProject(project);

  const saveProjectEdit = async (
    projectId: string,
    data: { title: string; description: string },
  ) => {
    try {
      await api.put(`/projects/${projectId}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProjects((prev) =>
        prev.map((p) =>
          p._id === projectId
            ? { ...p, title: data.title, description: data.description }
            : p,
        ),
      );

      toast.success("Projeto atualizado com sucesso.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erro ao atualizar projeto");
      throw err;
    }
  };

  const addTask = async (projectId: string, form: HTMLFormElement) => {
    const titleInput = form[0] as HTMLInputElement;
    const descInput = form[1] as HTMLInputElement;
    if (!titleInput.value || !descInput.value) return;

    try {
      const res = await api.post(
        "/tasks",
        {
          projectId,
          title: titleInput.value,
          description: descInput.value,
          status: "a_fazer",
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const newTask = res.data.task;
      setProjects((prev) =>
        prev.map((p) =>
          p._id === projectId
            ? { ...p, tasks: [...(p.tasks || []), newTask] }
            : p,
        ),
      );

      titleInput.value = "";
      descInput.value = "";
      toast.success("Tarefa adicionada com sucesso.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erro ao adicionar tarefa");
    }
  };

  const updateTask = (projectId: string, task: Task) =>
    setEditingTask({ projectId, task });

  const saveTaskEdit = async (
    projectId: string,
    taskId: string,
    data: { title: string; description: string; status: Task["status"] },
  ) => {
    try {
      await api.put(
        `/tasks/${taskId}`,
        { title: data.title, description: data.description },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      await api.patch(
        `/tasks/${taskId}/status`,
        { status: data.status },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setProjects((prev) =>
        prev.map((p) =>
          p._id === projectId
            ? {
                ...p,
                tasks: p.tasks?.map((t) =>
                  t._id === taskId
                    ? {
                        ...t,
                        title: data.title,
                        description: data.description,
                        status: data.status,
                      }
                    : t,
                ),
              }
            : p,
        ),
      );

      toast.success("Tarefa atualizada com sucesso.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erro ao atualizar tarefa");
      throw err;
    }
  };

  const updateTaskStatus = async (
    projectId: string,
    task: Task,
    newStatus: Task["status"],
  ) => {
    try {
      await api.patch(
        `/tasks/${task._id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setProjects((prev) =>
        prev.map((p) =>
          p._id === projectId
            ? {
                ...p,
                tasks: p.tasks?.map((t) =>
                  t._id === task._id ? { ...t, status: newStatus } : t,
                ),
              }
            : p,
        ),
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erro ao atualizar status");
    }
  };

  const requestDeleteTask = (projectId: string, task: Task) => {
    openConfirm({
      title: "Excluir tarefa?",
      description: `Tem certeza que deseja excluir "${task.title}"?`,
      danger: true,
      confirmText: "Excluir",
      onConfirm: async () => {
        try {
          await api.delete(`/tasks/${task._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setProjects((prev) =>
            prev.map((p) =>
              p._id === projectId
                ? { ...p, tasks: p.tasks?.filter((t) => t._id !== task._id) }
                : p,
            ),
          );

          toast.success("Tarefa excluída com sucesso.");
        } catch (err: any) {
          console.error(err);
          toast.error(err.response?.data?.message || "Erro ao deletar tarefa");
        } finally {
          setConfirmOpen(false);
        }
      },
    });
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(
      (p) => projectFilter === "todos" || p.status === projectFilter,
    );
  }, [projects, projectFilter]);

  return (
    <div className="projects-shell">
      {isMobile && (
        <header className="projects-topbar">
          <button
            className="projects-menu-btn"
            onClick={toggleSidebar}
            aria-label="Abrir menu"
          >
            ☰
          </button>

          <div className="projects-topbar-title">
            <span className="projects-topbar-title-main">Projetos</span>
            {user?.name && (
              <span className="projects-topbar-sub">{user.name}</span>
            )}
          </div>

          <div className="projects-topbar-spacer" />
        </header>
      )}

      <div className="projects-container">
        <Sidebar
          user={user ?? undefined}
          onLogout={handleLogout}
          openSidebar={sidebarOpen}
          toggleSidebar={isMobile ? closeSidebar : undefined}
        />

        <main className="projects-main">
          <div className="projects-header">
            <div>
              <h2 className="projects-title">Projetos</h2>
              <p className="projects-subtitle">
                Crie projetos, gerencie tarefas e acompanhe status.
              </p>
            </div>

            <div className="projects-actions">
              <button
                className="btn-ghost"
                onClick={() => navigate("/dashboard")}
              >
                Voltar
              </button>

              <div className="filter">
                <label>Filtro:</label>
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value as any)}
                >
                  <option value="todos">Todos</option>
                  <option value="ativo">Ativo</option>
                  <option value="concluido">Concluído</option>
                </select>
              </div>
            </div>
          </div>

          <section className="card">
            <h3 className="card-title">Criar novo projeto</h3>
            <form
              className="form-row"
              onSubmit={(e) => {
                e.preventDefault();
                createProject(e.target as HTMLFormElement);
              }}
            >
              <input type="text" placeholder="Título do projeto" />
              <input type="text" placeholder="Descrição do projeto" />
              <button className="btn-primary" type="submit">
                Criar
              </button>
            </form>
          </section>

          {loading && <p>Carregando...</p>}
          {error && <p className="error-text">{error}</p>}
          {!loading && !error && filteredProjects.length === 0 && (
            <p>Nenhum projeto encontrado.</p>
          )}

          <div className="projects-list">
            {!loading &&
              !error &&
              filteredProjects.map((project) => {
                const q = taskFilters[project._id] || "";
                const filteredTasks = (project.tasks || []).filter(
                  (t) =>
                    t.title.toLowerCase().includes(q.toLowerCase()) ||
                    t.description.toLowerCase().includes(q.toLowerCase()),
                );

                return (
                  <section key={project._id} className="card">
                    <div className="project-head">
                      <div className="project-head-left">
                        <h3 className="project-title">{project.title}</h3>
                        <span
                          className={`badge ${project.status === "concluido" ? "badge-done" : "badge-active"}`}
                        >
                          {project.status === "concluido"
                            ? "Concluído"
                            : "Ativo"}
                        </span>
                      </div>

                      <div className="project-head-actions">
                        <button
                          className="btn-ghost"
                          onClick={() => updateProject(project)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-ghost"
                          onClick={() => completeProject(project._id)}
                        >
                          Concluir
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() =>
                            requestDeleteProject(project._id, project.title)
                          }
                        >
                          Deletar
                        </button>
                      </div>
                    </div>

                    <p className="project-desc">{project.description}</p>

                    <input
                      className="task-search"
                      type="text"
                      placeholder="Pesquisar tarefas..."
                      value={q}
                      onChange={(e) =>
                        setTaskFilters((prev) => ({
                          ...prev,
                          [project._id]: e.target.value,
                        }))
                      }
                    />

                    <div className="tasks">
                      {filteredTasks.map((task) => (
                        <div key={task._id} className="task">
                          <div className="task-main">
                            <div className="task-title-row">
                              <strong>{task.title}</strong>
                              <span
                                className={`task-badge task-${task.status}`}
                              >
                                {task.status === "a_fazer"
                                  ? "A fazer"
                                  : task.status === "em_progresso"
                                    ? "Em progresso"
                                    : "Feito"}
                              </span>
                            </div>
                            <p className="task-desc">{task.description}</p>
                          </div>

                          <div className="task-actions">
                            <select
                              value={task.status}
                              onChange={(e) =>
                                updateTaskStatus(
                                  project._id,
                                  task,
                                  e.target.value as Task["status"],
                                )
                              }
                            >
                              <option value="a_fazer">A Fazer</option>
                              <option value="em_progresso">Em Progresso</option>
                              <option value="feito">Feito</option>
                            </select>

                            <button
                              className="btn-ghost"
                              onClick={() => updateTask(project._id, task)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn-danger"
                              onClick={() =>
                                requestDeleteTask(project._id, task)
                              }
                            >
                              Deletar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <form
                      className="form-row form-row-task"
                      onSubmit={(e) => {
                        e.preventDefault();
                        addTask(project._id, e.target as HTMLFormElement);
                      }}
                    >
                      <input type="text" placeholder="Título da tarefa" />
                      <input type="text" placeholder="Descrição da tarefa" />
                      <button className="btn-primary" type="submit">
                        Adicionar
                      </button>
                    </form>
                  </section>
                );
              })}
          </div>

          {editingProject && (
            <EditProjectModal
              project={editingProject}
              onClose={() => setEditingProject(null)}
              onSave={(data) => saveProjectEdit(editingProject._id, data)}
            />
          )}

          {editingTask && (
            <EditTaskModal
              task={editingTask.task}
              onClose={() => setEditingTask(null)}
              onSave={(data) =>
                saveTaskEdit(editingTask.projectId, editingTask.task._id, data)
              }
            />
          )}

          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title={confirmTitle}
            description={confirmDesc}
            confirmText={confirmText}
            cancelText="Cancelar"
            danger={confirmDanger}
            onConfirm={async () => {
              if (onConfirmAction) await onConfirmAction();
            }}
          />
        </main>
      </div>
    </div>
  );
}

export default Projects;
