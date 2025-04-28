import React from "react";

import { cn } from "@/lib/utils";

export function EventInfoDiv({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-accent/10 flex w-fit items-center gap-x-2 rounded-lg px-2 py-1 backdrop-blur-xs",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
