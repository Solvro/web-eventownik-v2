import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import { verifySession } from "@/lib/session";
import { cn } from "@/lib/utils";

export async function AuthButton({
  variant = "outline",
  className,
}: {
  variant?: ButtonProps["variant"];
  className?: string;
}) {
  const session = await verifySession();
  const t = await getTranslations("Homepage");

  return (
    <Button
      asChild
      variant={variant}
      className={cn("border-foreground", className)}
    >
      {session === null ? (
        <Link href="/auth/login">{t("login")}</Link>
      ) : (
        <Link href="/dashboard/events">{t("organizerPanel")}</Link>
      )}
    </Button>
  );
}
