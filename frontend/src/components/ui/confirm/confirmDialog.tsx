import * as Dialog from "@radix-ui/react-dialog";
import "./confirmDialog.css";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;

  onConfirm: () => Promise<void> | void;
};

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  danger = false,
  onConfirm,
}: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="cd-overlay" />
        <Dialog.Content className="cd-content">
          <div className="cd-head">
            <Dialog.Title className="cd-title">{title}</Dialog.Title>
            <Dialog.Close className="cd-close" aria-label="Fechar">
              ✕
            </Dialog.Close>
          </div>

          <Dialog.Description className="cd-desc">{description}</Dialog.Description>

          <div className="cd-actions">
            <Dialog.Close asChild>
              <button className="cd-btn cd-btn-ghost">{cancelText}</button>
            </Dialog.Close>

            <button
              className={`cd-btn ${danger ? "cd-btn-danger" : "cd-btn-primary"}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}