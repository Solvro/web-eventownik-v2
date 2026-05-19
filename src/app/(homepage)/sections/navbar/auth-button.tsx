import { useTranslations } from "next-intl";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import { verifySession } from "@/lib/session";
import { cn } from "@/lib/utils";

function AuthButtonView({
  isLoggedIn,
  variant,
  className,
}: {
  isLoggedIn: boolean;
  variant?: ButtonProps["variant"];
  className?: string;
}) {
  const t = useTranslations("Homepage");

  return (
    <Button
      asChild
      variant={variant}
      className={cn("border-foreground", className)}
    >
      {isLoggedIn ? (
        <Link href="/auth/login">{t("login")}</Link>
      ) : (
        <Link href="/dashboard/events">{t("organizerPanel")}</Link>
      )}
    </Button>
  );
}

export async function AuthButton({
  variant = "outline",
  className,
}: {
  variant?: ButtonProps["variant"];
  className?: string;
}) {
  const session = await verifySession();

  return (
    <AuthButtonView
      isLoggedIn={session === null}
      variant={variant}
      className={className}
    />
  );
}
