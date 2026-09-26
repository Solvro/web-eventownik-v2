import { Slot } from "@radix-ui/react-slot";
import React from "react";

import { cn } from "@/lib/utils";

export function EventInfoDiv({
  children,
  className,
  asChild = false,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      className={cn(
        "bg-accent/50 flex w-fit items-center gap-x-2 rounded-lg px-2 py-1 backdrop-blur-xs",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
