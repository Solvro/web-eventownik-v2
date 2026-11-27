import type { LucideIcon } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-secondary animate-pulse rounded-3xl", className)} />
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center tracking-[-0.01em]">
      <div className="flex size-16 items-center justify-center rounded-full bg-[var(--mobile-accent)] text-[var(--mobile-accent-foreground)] shadow-[0_3px_9px_var(--mobile-accent-glow)]">
        <Icon className="size-7" />
      </div>
      <h2 className="text-base leading-[1.2] font-semibold">{title}</h2>
      {description === undefined ? null : (
        <p className="text-muted-foreground max-w-xs text-sm leading-5 font-medium">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

export function ErrorState({
  message = "Nie udało się wczytać danych.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center tracking-[-0.01em]">
      <div className="bg-card flex size-16 items-center justify-center rounded-full text-[var(--mobile-danger)]">
        <AlertTriangle className="size-7" />
      </div>
      <p className="text-muted-foreground text-sm font-medium">{message}</p>
      {onRetry === undefined ? null : (
        <Button
          variant="outline"
          onClick={onRetry}
          className="border-border h-12 rounded-3xl px-6 font-semibold"
        >
          Spróbuj ponownie
        </Button>
      )}
    </div>
  );
}
