"use client";

import { useTranslations } from "next-intl";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LogoutSubmitButton({
  variant,
  className,
}: {
  variant?: ButtonProps["variant"];
  className?: string;
}) {
  const { pending } = useFormStatus();
  const t = useTranslations("Dashboard");

  return (
    <Button
      type="submit"
      disabled={pending}
      variant={variant}
      className={cn("border-foreground", className)}
    >
      {pending ? t("loggingOut") : t("logout")}
    </Button>
  );
}
