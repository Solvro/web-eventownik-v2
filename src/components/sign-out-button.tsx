import { auth, signOut } from "@/auth";

import { Button } from "./ui/button";

export async function SignOutButton() {
  const session = await auth();
  return session === null ? null : (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <Button type="submit">Sign Out</Button>
    </form>
  );
}
