import type { HTMLAttributes } from "react";

export function Card({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-xl2 bg-white shadow-card p-4 ${className}`} {...rest}>
      {children}
    </div>
  );
}
