import { useEffect, useState } from "react";

export type TaskForEdit = {
  _id: string;
  title: string;
  description: string;
  status: "a_fazer" | "em_progresso" | "feito";
};

type Props = {
  task: TaskForEdit;
  onClose: () => void;
  onSave: (data: { title: string; description: string; status: TaskForEdit["status"] }) => Promise<void> | void;
};

export default function EditTaskModal({ task, onClose, onSave }: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<TaskForEdit["status"]>(task.status);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSave();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  },
   []);

  const canSave = title.trim().length > 0 && description.trim().length > 0 && !saving;

  const handleSave = async () => {
    if (!canSave) {
      setError("Preencha título e descrição.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await onSave({ title: title.trim(), description: description.trim(), status });
      onClose();
    } catch (e: any) {
      setError(e?.message || "Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="etm-overlay" onMouseDown={onClose}>
      <div className="etm-dialog" onMouseDown={(e) => e.stopPropagation()}>
        <div className="etm-head">
          <div>
            <h3 className="etm-title">Editar tarefa</h3>
            <p className="etm-subtitle">Atualize título, descrição e status.</p>
          </div>

          <button className="etm-close" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="etm-body">
          <label className="etm-label">
            Título
            <input
              className="etm-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da tarefa"
              autoFocus
            />
          </label>

          <label className="etm-label">
            Descrição
            <textarea
              className="etm-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição da tarefa"
              rows={4}
            />
          </label>

          <label className="etm-label">
            Status
            <select className="etm-select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="a_fazer">A Fazer</option>
              <option value="em_progresso">Em Progresso</option>
              <option value="feito">Feito</option>
            </select>
          </label>

          {error && <div className="etm-error">{error}</div>}
        </div>

        <div className="etm-actions">
          <button className="etm-btn etm-btn-ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className="etm-btn etm-btn-primary" onClick={handleSave} disabled={!canSave}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>

        <div className="etm-hint">Dica: Ctrl/⌘ + Enter para salvar</div>
      </div>
    </div>
  );
}