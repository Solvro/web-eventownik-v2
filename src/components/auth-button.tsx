import Link from "next/link";

import { auth, signOut } from "@/auth";

import { Button } from "./ui/button";

export async function AuthButton() {
  const session = await auth();
  return session === null ? (
    <Button asChild>
      <Link href="/auth/login">Zaloguj się</Link>
    </Button>
  ) : (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <Button type="submit">Wyloguj się</Button>
    </form>
  );
}
