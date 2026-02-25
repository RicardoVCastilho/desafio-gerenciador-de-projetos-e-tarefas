import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

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

function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Filtro global de projetos
  const [projectFilter, setProjectFilter] = useState<"todos" | "ativo" | "concluido">("todos");

  // Filtros de tarefas por projeto
  const [taskFilters, setTaskFilters] = useState<Record<string, string>>({});

  // ----------------- Buscar projetos e tarefas -----------------
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects", { headers: { Authorization: `Bearer ${token}` } });
        const projectsData: Project[] = res.data;

        const projectsWithTasks = await Promise.all(
          projectsData.map(async (project) => {
            const tasksRes = await api.get(`/tasks/project/${project._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            return { ...project, tasks: tasksRes.data };
          })
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

  // ----------------- Funções de Projeto -----------------
  const createProject = async (form: HTMLFormElement) => {
    const titleInput = form[0] as HTMLInputElement;
    const descInput = form[1] as HTMLInputElement;
    if (!titleInput.value || !descInput.value) return;

    try {
      const res = await api.post(
        "/projects",
        { title: titleInput.value, description: descInput.value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjects((prev) => [...prev, { ...res.data, tasks: [] }]);
      titleInput.value = "";
      descInput.value = "";
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Erro ao criar projeto");
    }
  };

  const deleteProject = async (projectId: string, title: string) => {
    if (!confirm(`Deletar o projeto "${title}"?`)) return;
    try {
      await api.delete(`/projects/${projectId}`, { headers: { Authorization: `Bearer ${token}` } });
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Erro ao deletar projeto");
    }
  };

  const completeProject = async (projectId: string) => {
    try {
      await api.patch(`/projects/${projectId}/complete`, null, { headers: { Authorization: `Bearer ${token}` } });
      setProjects((prev) =>
        prev.map((p) => (p._id === projectId ? { ...p, status: "concluido" } : p))
      );
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Erro ao concluir projeto");
    }
  };

  const updateProject = async (project: Project) => {
    const newTitle = prompt("Novo título", project.title);
    const newDescription = prompt("Nova descrição", project.description);
    if (!newTitle || !newDescription) return;

    try {
      await api.put(
        `/projects/${project._id}`,
        { title: newTitle, description: newDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjects((prev) =>
        prev.map((p) =>
          p._id === project._id ? { ...p, title: newTitle, description: newDescription } : p
        )
      );
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Erro ao atualizar projeto");
    }
  };

  // ----------------- Funções de Tarefas -----------------
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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newTask = res.data.task;
      setProjects((prev) =>
        prev.map((p) => (p._id === projectId ? { ...p, tasks: [...(p.tasks || []), newTask] } : p))
      );

      titleInput.value = "";
      descInput.value = "";
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Erro ao adicionar tarefa");
    }
  };

  const updateTask = async (projectId: string, task: Task) => {
    const newTitle = prompt("Novo título", task.title);
    const newDesc = prompt("Nova descrição", task.description);
    if (!newTitle || !newDesc) return;

    try {
      await api.put(
        `/tasks/${task._id}`,
        { title: newTitle, description: newDesc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjects((prev) =>
        prev.map((p) =>
          p._id === projectId
            ? {
                ...p,
                tasks: p.tasks?.map((t) => (t._id === task._id ? { ...t, title: newTitle, description: newDesc } : t)),
              }
            : p
        )
      );
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Erro ao atualizar tarefa");
    }
  };

  const updateTaskStatus = async (projectId: string, task: Task, newStatus?: "a_fazer" | "em_progresso" | "feito") => {
    try {
      const statusToSend = newStatus || task.status;
      await api.patch(`/tasks/${task._id}/status`, { status: statusToSend }, { headers: { Authorization: `Bearer ${token}` } });

      setProjects((prev) =>
        prev.map((p) =>
          p._id === projectId
            ? { ...p, tasks: p.tasks?.map((t) => (t._id === task._id ? { ...t, status: statusToSend } : t)) }
            : p
        )
      );
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Erro ao atualizar status");
    }
  };

  const deleteTask = async (projectId: string, task: Task) => {
    if (!confirm(`Deletar a tarefa "${task.title}"?`)) return;
    try {
      await api.delete(`/tasks/${task._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setProjects((prev) =>
        prev.map((p) =>
          p._id === projectId ? { ...p, tasks: p.tasks?.filter((t) => t._id !== task._id) } : p
        )
      );
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Erro ao deletar tarefa");
    }
  };

  // ----------------- Render -----------------
  return (
    <div>
      <h1>ProTsK - Projetos</h1>

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => navigate("/dashboard")}>Voltar para Dashboard</button>
      </div>

      <h2>Criar novo projeto</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createProject(e.target as HTMLFormElement);
        }}
      >
        <input type="text" placeholder="Título do projeto" />
        <input type="text" placeholder="Descrição do projeto" />
        <button>Criar Projeto</button>
      </form>

      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && projects.length === 0 && <p>Nenhum projeto encontrado.</p>}

      <div style={{ marginBottom: "1rem" }}>
        <label>Filtrar projetos: </label>
        <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value as "todos" | "ativo" | "concluido")}>
          <option value="todos">Todos</option>
          <option value="ativo">Ativo</option>
          <option value="concluido">Concluído</option>
        </select>
      </div>

      {!loading &&
        !error &&
        projects
          .filter((project) => projectFilter === "todos" || project.status === projectFilter)
          .map((project) => {
            // Filtro de tarefas deste projeto
            const filteredTasks = project.tasks?.filter((task) =>
              task.title.toLowerCase().includes((taskFilters[project._id] || "").toLowerCase()) ||
              task.description.toLowerCase().includes((taskFilters[project._id] || "").toLowerCase())
            );

            return (
              <div key={project._id} style={{ border: "1px solid #ccc", margin: "1rem", padding: "1rem" }}>
                <h2>
                  {project.title} ({project.status})
                </h2>
                <p>{project.description}</p>

                <button onClick={() => updateProject(project)}>Atualizar Projeto</button>
                <button onClick={() => completeProject(project._id)}>Concluir Projeto</button>
                <button onClick={() => deleteProject(project._id, project.title)}>Deletar Projeto</button>

                <h3>Tarefas:</h3>

                <input
                  type="text"
                  placeholder="Pesquisar tarefas..."
                  value={taskFilters[project._id] || ""}
                  onChange={(e) => setTaskFilters((prev) => ({ ...prev, [project._id]: e.target.value }))}
                  style={{ marginBottom: "1rem", display: "block" }}
                />

                <ul>
                  {filteredTasks?.map((task) => (
                    <li key={task._id}>
                      <strong>{task.title}</strong> ({task.status}) - {task.description}
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(project._id, task, e.target.value as "a_fazer" | "em_progresso" | "feito")}
                      >
                        <option value="a_fazer">A Fazer</option>
                        <option value="em_progresso">Em Progresso</option>
                        <option value="feito">Feito</option>
                      </select>
                      <button onClick={() => updateTask(project._id, task)}>Editar</button>
                      <button onClick={() => deleteTask(project._id, task)}>Deletar</button>
                    </li>
                  ))}
                </ul>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addTask(project._id, e.target as HTMLFormElement);
                  }}
                >
                  <input type="text" placeholder="Título da tarefa" />
                  <input type="text" placeholder="Descrição da tarefa" />
                  <button>Adicionar Tarefa</button>
                </form>
              </div>
            );
          })}
    </div>
  );
}

export default Projects;