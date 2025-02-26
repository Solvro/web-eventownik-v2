import Link from "next/link";

import { deleteSession, verifySession } from "@/lib/session";

import { Button } from "./ui/button";

export async function AuthButton() {
  const session = await verifySession();
  return session === null ? (
    <Button asChild>
      <Link href="/auth/login">Zaloguj się</Link>
    </Button>
  ) : (
    <form
      action={async () => {
        "use server";
        await deleteSession();
      }}
    >
      <Button type="submit">Wyloguj się</Button>
    </form>
  );
}
