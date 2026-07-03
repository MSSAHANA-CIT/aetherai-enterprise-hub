import { useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { modal, modalBackdrop } from "../animations";
import { Button } from "./Button";
import { IconButton } from "./Button";

export type ModalVariant = "standard" | "confirmation" | "danger" | "large" | "drawer" | "fullscreen";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  variant?: ModalVariant;
  footer?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  loading?: boolean;
}

const sizeClasses: Record<ModalVariant, string> = {
  standard: "max-w-md",
  confirmation: "max-w-sm",
  danger: "max-w-sm",
  large: "max-w-2xl",
  drawer: "max-w-md h-full ml-auto rounded-none rounded-l-2xl",
  fullscreen: "max-w-none w-full h-full rounded-none",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  variant = "standard",
  footer,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  loading,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const isDrawer = variant === "drawer";
  const isFullscreen = variant === "fullscreen";

  return (
    <AnimatePresence>
      {open && (
        <div
          className={cn(
            "fixed inset-0 z-50 flex",
            isDrawer ? "justify-end" : "items-center justify-center p-4"
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
        >
          <motion.div
            className="absolute inset-0 bg-ds-scrim backdrop-blur-sm"
            variants={modalBackdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            className={cn(
              "relative w-full bg-ds-surface-raised border border-ds-border shadow-ds-modal rounded-2xl overflow-hidden",
              sizeClasses[variant]
            )}
            variants={modal}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {(title || !isFullscreen) && (
              <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-ds-border">
                <div>
                  {title && (
                    <h2 id="modal-title" className="text-lg font-semibold text-ds-text-primary">
                      {title}
                    </h2>
                  )}
                  {description && <p className="text-sm text-ds-text-muted mt-1">{description}</p>}
                </div>
                <IconButton aria-label="Close modal" onClick={onClose} variant="ghost" size="sm">
                  <X className="w-4 h-4" />
                </IconButton>
              </div>
            )}
            <div className="px-6 py-5">{children}</div>
            {(footer || variant === "confirmation" || variant === "danger") && (
              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-ds-border bg-ds-glass">
                {footer ?? (
                  <>
                    <Button variant="ghost" onClick={onClose}>
                      {cancelLabel}
                    </Button>
                    <Button
                      variant={variant === "danger" ? "danger" : "primary"}
                      onClick={onConfirm}
                      loading={loading}
                    >
                      {confirmLabel}
                    </Button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export const ConfirmationModal = (props: Omit<ModalProps, "variant">) => (
  <Modal variant="confirmation" {...props} />
);

export const DrawerModal = (props: Omit<ModalProps, "variant">) => (
  <Modal variant="drawer" {...props} />
);

export const FullscreenModal = (props: Omit<ModalProps, "variant">) => (
  <Modal variant="fullscreen" {...props} />
);
