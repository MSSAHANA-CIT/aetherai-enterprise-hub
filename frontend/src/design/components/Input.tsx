import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Search, Upload } from "lucide-react";
import { cn } from "../../lib/utils";
import { errorShake } from "../animations";

export type InputState = "default" | "error" | "success" | "loading";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  success?: string;
  state?: InputState;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const inputBase =
  "w-full rounded-xl bg-ds-glass border px-4 py-2.5 text-sm text-ds-text-primary placeholder:text-ds-text-muted transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed";

const stateClasses: Record<InputState, string> = {
  default: "border-ds-border focus:border-ds-focus focus:ring-ds-focus/20 focus:bg-ds-glass-medium hover:border-ds-border-strong",
  error: "border-ds-danger-border focus:border-ds-danger focus:ring-ds-danger/20 bg-ds-danger-muted/30",
  success: "border-ds-success-border focus:border-ds-success focus:ring-ds-success/20 bg-ds-success-muted/30",
  loading: "border-ds-border opacity-70 cursor-wait",
};

function FieldWrapper({
  label,
  hint,
  error,
  success,
  children,
  htmlFor,
}: {
  label?: string;
  hint?: string;
  error?: string;
  success?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="block text-ds-label text-ds-text-secondary">
          {label}
        </label>
      )}
      {children}
      {error && (
        <motion.p {...errorShake} className="text-xs text-ds-danger" role="alert">
          {error}
        </motion.p>
      )}
      {success && !error && <p className="text-xs text-ds-success">{success}</p>}
      {hint && !error && !success && <p className="text-xs text-ds-text-muted">{hint}</p>}
    </div>
  );
}

function resolveState(state?: InputState, error?: string, success?: string): InputState {
  if (error) return "error";
  if (success) return "success";
  return state ?? "default";
}

export const TextInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, success, state, leftIcon, rightIcon, id, ...props }, ref) => {
    const resolved = resolveState(state, error, success);
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <FieldWrapper label={label} hint={hint} error={error} success={success} htmlFor={inputId}>
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ds-text-muted pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(inputBase, stateClasses[resolved], leftIcon && "pl-10", rightIcon && "pr-10", className)}
            aria-invalid={resolved === "error"}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-ds-text-muted">{rightIcon}</div>
          )}
          {resolved === "loading" && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ds-text-muted animate-spin" />
          )}
        </div>
      </FieldWrapper>
    );
  }
);
TextInput.displayName = "TextInput";

export const EmailInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <TextInput ref={ref} type="email" autoComplete="email" {...props} />
));
EmailInput.displayName = "EmailInput";

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    return (
      <TextInput
        ref={ref}
        type={visible ? "text" : "password"}
        autoComplete="current-password"
        rightIcon={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="text-ds-text-muted hover:text-ds-text-secondary transition-colors"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
        className={className}
        {...props}
      />
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export interface OtpInputProps extends Omit<InputProps, "value" | "onChange"> {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}

export function OtpInput({ length = 6, value, onChange, label, error }: OtpInputProps) {
  const digits = value.padEnd(length, " ").split("").slice(0, length);

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return;
    const arr = value.split("");
    arr[index] = char;
    onChange(arr.join("").slice(0, length));
  };

  return (
    <FieldWrapper label={label} error={error}>
      <div className="flex gap-2" role="group" aria-label={label ?? "One-time password"}>
        {digits.map((digit, i) => (
          <input
            key={i}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit.trim()}
            aria-label={`Digit ${i + 1}`}
            className={cn(
              inputBase,
              "w-11 h-12 text-center text-lg font-mono",
              error ? stateClasses.error : stateClasses.default
            )}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digit.trim() && i > 0) {
                const prev = (e.target as HTMLInputElement).previousElementSibling as HTMLInputElement | null;
                prev?.focus();
              }
            }}
          />
        ))}
      </div>
    </FieldWrapper>
  );
}

export const SearchInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <TextInput ref={ref} type="search" leftIcon={<Search className="w-4 h-4" />} {...props} />
));
SearchInput.displayName = "SearchInput";

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  success?: string;
  state?: InputState;
  rows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, success, state, id, rows = 4, ...props }, ref) => {
    const resolved = resolveState(state, error, success);
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <FieldWrapper label={label} hint={hint} error={error} success={success} htmlFor={inputId}>
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={cn(inputBase, stateClasses[resolved], "resize-y min-h-[100px]", className)}
          aria-invalid={resolved === "error"}
          {...props}
        />
      </FieldWrapper>
    );
  }
);
Textarea.displayName = "Textarea";

export interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, hint, error, options, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const resolved = error ? "error" : "default";

    return (
      <FieldWrapper label={label} hint={hint} error={error} htmlFor={inputId}>
        <select
          ref={ref}
          id={inputId}
          className={cn(inputBase, stateClasses[resolved], "appearance-none cursor-pointer", className)}
          aria-invalid={!!error}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-ds-surface text-ds-text-primary">
              {opt.label}
            </option>
          ))}
        </select>
      </FieldWrapper>
    );
  }
);
Select.displayName = "Select";

export const DateInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <TextInput ref={ref} type="date" {...props} />
));
DateInput.displayName = "DateInput";

export interface FileUploadProps extends Omit<InputProps, "type"> {
  accept?: string;
  onFileSelect?: (file: File | null) => void;
}

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  ({ label, hint, error, accept, onFileSelect, className, ...props }, ref) => {
    const inputId = label?.toLowerCase().replace(/\s+/g, "-") ?? "file-upload";

    return (
      <FieldWrapper label={label} hint={hint} error={error} htmlFor={inputId}>
        <label
          htmlFor={inputId}
          className={cn(
            inputBase,
            stateClasses.default,
            "flex items-center justify-center gap-2 cursor-pointer border-dashed hover:border-ds-primary/40 hover:bg-ds-glass-medium",
            className
          )}
        >
          <Upload className="w-4 h-4 text-ds-text-muted" />
          <span className="text-ds-text-muted">Choose file or drag here</span>
          <input
            ref={ref}
            id={inputId}
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(e) => onFileSelect?.(e.target.files?.[0] ?? null)}
            {...props}
          />
        </label>
      </FieldWrapper>
    );
  }
);
FileUpload.displayName = "FileUpload";
