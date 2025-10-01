import Link from "next/link";

import { deleteSession, verifySession } from "@/lib/session";
import { cn } from "@/lib/utils";

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
  return session === null ? (
    <Button
      asChild
      variant={variant}
      className={cn("border-foreground", className)}
    >
      <Link href="/auth/login">Zaloguj się</Link>
    </Button>
  ) : (
    <form
      className={className}
      action={async () => {
        "use server";
        await deleteSession();
      }}
    >
      <Button
        type="submit"
        variant={variant}
        className={cn("border-foreground", className)}
      >
        Wyloguj się
      </Button>
    </form>
  );
}
