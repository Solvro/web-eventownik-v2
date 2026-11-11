import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { logout, verifySession } from "@/lib/session";
import { cn } from "@/lib/utils";

import { LogoutSubmitButton } from "./logout-submit-button";
import { Button } from "./ui/button";
import type { ButtonProps } from "./ui/button";

export async function AuthButton({
  variant = "outline",
  className,
}: {
  variant?: ButtonProps["variant"];
  className?: string;
}) {
  const session = await verifySession();
  const t = await getTranslations("Dashboard");

  return session === null ? (
    <Button
      asChild
      variant={variant}
      className={cn("border-foreground", className)}
    >
      <Link href="/auth/login">{t("login")}</Link>
    </Button>
  ) : (
    <form
      className={className}
      action={async () => {
        "use server";
        await logout();
      }}
    >
      <LogoutSubmitButton variant={variant} className={className} />
    </form>
  );
}
