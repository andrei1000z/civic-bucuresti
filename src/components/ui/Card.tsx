import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  accentColor?: string;
}

export function Card({ children, hover, accentColor, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "relative bg-[var(--color-surface)] rounded-[var(--radius-card)] p-4 sm:p-5",
        "border border-[var(--color-border)] shadow-[var(--shadow-soft)]",
        "transition-all duration-200",
        hover && "hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] hover:border-[var(--color-primary)]/30",
        accentColor && "border-l-4",
        className
      )}
      style={accentColor ? { borderLeftColor: accentColor } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mb-3", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-lg font-semibold text-[var(--color-text)] font-[family-name:var(--font-sora)]", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-sm text-[var(--color-text-muted)]", className)}>{children}</p>;
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("text-sm text-[var(--color-text)]", className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between", className)}>
      {children}
    </div>
  );
}
