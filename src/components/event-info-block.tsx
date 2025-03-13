import { cn } from "@/lib/utils";

function EventInfoBlock({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-fit items-center gap-x-2 rounded-lg bg-accent-foreground/60 px-2 py-1 text-background backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { EventInfoBlock };
