import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";

interface NotFoundProps {
  whatNotFound: "event" | "form" | "user" | "blocks";
}

export function EventNotFound({ whatNotFound }: NotFoundProps) {
  const messages = {
    event: "Nie znaleziono wydarzenia 😪",
    form: "Nie znaleziono formularza 😪",
    user: "Nie udało się pobrać twoich danych 😪",
    blocks:
      "Nie udało się pobrać informacji dla przynajmniej jednego z bloków w tym formularzu 😪",
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{messages[whatNotFound]}</h1>
        <p className="text-lg">
          Sprawdź, czy link jest poprawny lub skontaktuj się z organizatorem.
        </p>
        <Link href="/">
          <Button variant="default" className="mt-6">
            Wróć na stronę główną
          </Button>
        </Link>
      </div>
    </div>
  );
}
