import { useEffect, useState } from "react";

type ProjectStatus = "ativo" | "concluido";

export type ProjectForEdit = {
  _id: string;
  title: string;
  description: string;
  status: ProjectStatus;
};

type Props = {
  project: ProjectForEdit;
  onClose: () => void;
  onSave: (data: { title: string; description: string }) => Promise<void> | void;
};

export default function EditProjectModal({ project, onClose, onSave }: Props) {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  // ESC + trava scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Ctrl/Cmd + Enter salva
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSave();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSave = title.trim().length > 0 && description.trim().length > 0 && !saving;

  const handleSave = async () => {
    if (!canSave) {
      setError("Preencha título e descrição.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await onSave({ title: title.trim(), description: description.trim() });
      onClose();
    } catch (e: any) {
      setError(e?.message || "Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="epm-overlay" onMouseDown={onClose}>
      <div className="epm-dialog" onMouseDown={(e) => e.stopPropagation()}>
        <div className="epm-head">
          <div>
            <h3 className="epm-title">Editar projeto</h3>
            <p className="epm-subtitle">Atualize o título e a descrição do projeto.</p>
          </div>

          <button className="epm-close" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="epm-body">
          <label className="epm-label">
            Título
            <input
              className="epm-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do projeto"
              autoFocus
            />
          </label>

          <label className="epm-label">
            Descrição
            <textarea
              className="epm-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do projeto"
              rows={4}
            />
          </label>

          {error && <div className="epm-error">{error}</div>}
        </div>

        <div className="epm-actions">
          <button className="epm-btn epm-btn-ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className="epm-btn epm-btn-primary" onClick={handleSave} disabled={!canSave}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>

        <div className="epm-hint">Dica: Ctrl/⌘ + Enter para salvar</div>
      </div>
    </div>
  );
}