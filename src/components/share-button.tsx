"use client";

import { Share2Icon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <Tooltip open={isCopied}>
      <TooltipTrigger asChild>
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
      </TooltipTrigger>
      <TooltipContent>{tooltipText}</TooltipContent>
    </Tooltip>
  );
}
