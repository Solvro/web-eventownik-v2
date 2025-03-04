import { cn } from "@/lib/utils";

function EventInfoDiv({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-fit items-center gap-x-2 rounded-lg bg-accent/10 px-2 py-1 backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { EventInfoDiv };
