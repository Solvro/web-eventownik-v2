"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import { Share2Icon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  url: string;
  variant?: "icon" | "full";
  buttonVariant?:
    | "link"
    | "outline"
    | "ghost"
    | "default"
    | "destructive"
    | "secondary"
    | null
    | undefined;
  className?: string;
  label?: string;
  tooltipText?: string;
}

export function ShareButton({
  url,
  variant = "full",
  buttonVariant = "outline",
  className,
  label = "Udostępnij",
  tooltipText = "Skopiowano do schowka!",
}: ShareButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [isCopied]);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setIsCopied(true);
      })
      .catch((error: unknown) => {
        console.error("Copy failed:", error);
      });
  };

  return (
    <Tooltip.Provider>
      <Tooltip.Root open={isCopied}>
        <Tooltip.Trigger asChild>
          <Button
            variant={buttonVariant}
            onClick={handleCopy}
            className={className}
            aria-label={variant === "icon" ? label : undefined}
          >
            <Share2Icon
              className={variant === "full" ? "mr-2 h-4 w-4" : "h-4 w-4"}
            />
            {variant === "full" && label}
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="rounded bg-gray-900 px-2 py-1 text-sm text-white"
            sideOffset={5}
          >
            {tooltipText}
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
