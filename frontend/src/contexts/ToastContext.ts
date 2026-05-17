import { createContext, useContext } from "react";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export interface ToastContextType {
  showToast: (message: string, type?: Toast["type"]) => void;
}

export const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);
