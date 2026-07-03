import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, Loader2, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { toast as toastVariants } from "../animations";

export type ToastVariant = "success" | "error" | "loading" | "info";

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
}

export interface ToastProps extends Omit<ToastItem, "id"> {
  onDismiss?: () => void;
}

const icons: Record<ToastVariant, typeof Info> = {
  success: CheckCircle2,
  error: AlertCircle,
  loading: Loader2,
  info: Info,
};

const variantClasses: Record<ToastVariant, string> = {
  success: "border-ds-success-border",
  error: "border-ds-danger-border",
  loading: "border-ds-border",
  info: "border-ds-info-border",
};

export function Toast({ variant, title, description, onDismiss }: ToastProps) {
  const Icon = icons[variant];

  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "flex items-start gap-3 w-full max-w-sm p-4 rounded-xl border bg-ds-surface-raised shadow-ds-floating",
        variantClasses[variant]
      )}
      role="status"
      aria-live="polite"
    >
      <Icon
        className={cn("w-5 h-5 shrink-0 mt-0.5", variant === "loading" && "animate-spin")}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ds-text-primary">{title}</p>
        {description && <p className="text-xs text-ds-text-muted mt-0.5">{description}</p>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-ds-text-muted hover:text-ds-text-primary"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

interface ToastContextValue {
  show: (toast: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { ...toast, id }]);
      if (toast.variant !== "loading") {
        setTimeout(() => dismiss(id), toast.duration ?? 4000);
      }
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
        aria-label="Notifications"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <Toast {...t} onDismiss={() => dismiss(t.id)} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
