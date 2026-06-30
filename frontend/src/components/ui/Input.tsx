import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-10 px-3.5 text-sm text-neutral-900 bg-white border rounded-lg transition-all duration-150",
              "placeholder:text-neutral-400",
              "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500",
              "disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed",
              icon && "pl-10",
              error
                ? "border-error-300 focus:ring-error-500/20 focus:border-error-500"
                : "border-neutral-300",
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-error-600">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-neutral-400">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const selectId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full h-10 px-3.5 text-sm text-neutral-900 bg-white border rounded-lg transition-all duration-150 cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500",
            "disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed",
            error ? "border-error-300" : "border-neutral-300",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1.5 text-xs text-error-600">{error}</p>}
      </div>
    );
  },
);
Select.displayName = "Select";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "w-full px-3.5 py-2.5 text-sm text-neutral-900 bg-white border rounded-lg transition-all duration-150 resize-y min-h-[100px]",
            "placeholder:text-neutral-400",
            "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500",
            "disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed",
            error ? "border-error-300" : "border-neutral-300",
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-error-600">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-neutral-400">{hint}</p>}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
