import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Ya, Hapus",
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(13,26,20,0.5)] backdrop-blur-xs animate-in fade-in duration-200 px-4">
      <div className="bg-white border border-surface-3 p-8 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="font-display font-bold text-xl text-primary-900 mb-2">
          {title}
        </h3>
        <p className="font-body text-sm text-wiraText-secondary mb-8 leading-relaxed">
          {message}
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-surface text-wiraText-secondary font-body font-medium text-sm border border-surface-3 hover:bg-surface-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-red-600 text-white! font-body font-medium text-sm hover:bg-red-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
