"use client";

import { Share2Icon } from "lucide-react";
import { useState } from "react";

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

  const handleCopy = () => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
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
