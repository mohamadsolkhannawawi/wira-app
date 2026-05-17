import { useState, useEffect, useCallback } from "react";
import { CheckCircle, X } from "lucide-react";
import { ToastContext, type Toast } from "../contexts/ToastContext";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container - top right */}
      <div className="fixed top-4 right-4 z-100 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 4000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const bgColor =
    toast.type === "success"
      ? "bg-primary-800"
      : toast.type === "error"
        ? "bg-red-600"
        : "bg-gray-800";

  return (
    <div
      className={`${bgColor} text-white px-5 py-3 shadow-2xl flex items-center gap-3 pointer-events-auto animate-in slide-in-from-right duration-300 min-w-72 max-w-sm`}
    >
      <CheckCircle className="w-5 h-5 shrink-0" />
      <span className="font-body text-sm font-medium flex-1">
        {toast.message}
      </span>
      <button
        onClick={onRemove}
        className="text-white/70 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
