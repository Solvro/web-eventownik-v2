import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { login } from "../actions";

export default function LoginPage() {
  return (
    <>
      <div className="space-y-2 text-center">
        <p className="text-3xl font-black">Logowanie organizatora</p>
        <p>Podaj swój email by się zalogować.</p>
      </div>
      <form action={login} className="w-full max-w-sm space-y-4">
        <Input type="email" name="email" placeholder="E-mail" />
        <Input type="password" name="password" placeholder="Hasło" />
        <Button type="submit" className="w-full">
          Kontynuuj
        </Button>
        <Button className="w-full text-neutral-600" variant="link" asChild>
          <Link href="/auth/register">
            Nie masz jeszcze konta? Zarejestruj się
          </Link>
        </Button>
      </form>
    </>
  );
}
