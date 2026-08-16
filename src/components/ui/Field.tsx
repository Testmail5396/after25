import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
}

export function Field({ label, htmlFor, error, required, children, hint }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-cocoa-600">
        {label}
        {required && <span className="text-berry-500"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-cocoa-400">{hint}</p>}
      {error && (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const baseInputClasses =
  "h-11 w-full rounded-xl border border-cream-300 bg-white px-3.5 text-base text-cocoa-700 placeholder:text-cocoa-400/60 focus:border-berry-400 outline-none";

export const inputClassName = (hasError?: boolean) =>
  `${baseInputClasses} ${hasError ? "border-red-400" : ""}`;
