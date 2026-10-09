"use client";

import { Share2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShareButtonProps {
  path: string;
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
}

export function ShareButton({
  path,
  variant = "full",
  buttonVariant = "outline",
  className,
  label,
}: ShareButtonProps) {
  const t = useTranslations("Dashboard");
  const buttonLabel = label ?? t("share");
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    const url = `${window.location.origin}/${path}`;
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
          aria-label={variant === "icon" ? buttonLabel : undefined}
        >
          <Share2Icon
            className={variant === "full" ? "mr-2 h-4 w-4" : "h-4 w-4"}
          />
          {variant === "full" && buttonLabel}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t("copiedToClipboard")}</TooltipContent>
    </Tooltip>
  );
}
