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
        "bg-accent-foreground/60 text-background flex w-fit items-center gap-x-2 rounded-lg px-2 py-1 backdrop-blur-xs",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { EventInfoBlock };
