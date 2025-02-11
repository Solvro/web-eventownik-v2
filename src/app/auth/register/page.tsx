import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { register } from "../actions";

export default function Login() {
  return (
    <>
      <div className="space-y-2 text-center">
        <p className="text-3xl font-black">Rejestracja organizatora</p>
        <p>Podaj swój email by się zarejestrować.</p>
      </div>
      <form action={register} className="w-full max-w-sm space-y-4">
        <Input type="email" name="email" placeholder="E-mail" />
        <Input type="password" name="password" placeholder="Hasło" />
        <Input type="text" name="firstName" placeholder="Imię" />
        <Input type="text" name="lastName" placeholder="Nazwisko" />
        <Button type="submit" className="w-full">
          Kontynuuj
        </Button>
        <Button className="w-full text-neutral-600" variant="link" asChild>
          <Link href="/auth/login">Posiadasz już konto? Zaloguj się</Link>
        </Button>
      </form>
    </>
  );
}
