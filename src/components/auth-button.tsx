import Link from "next/link";

import { deleteSession, verifySession } from "@/lib/session";

import { Button } from "./ui/button";

export async function AuthButton() {
  const session = await verifySession();
  return session === null ? (
    <Button asChild variant="outline" className="border-foreground">
      <Link href="/auth/login">Zaloguj się</Link>
    </Button>
  ) : (
    <form
      action={async () => {
        "use server";
        await deleteSession();
      }}
    >
      <Button type="submit" variant="outline" className="border-foreground">
        Wyloguj się
      </Button>
    </form>
  );
}
