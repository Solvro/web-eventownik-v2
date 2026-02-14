import { HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/ui/credenza";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function HelpDialog() {
  return (
    <Credenza>
      <Tooltip>
        <TooltipTrigger asChild>
          <CredenzaTrigger asChild>
            <Button size="icon" variant="outline">
              <HelpCircle />
            </Button>
          </CredenzaTrigger>
        </TooltipTrigger>
        <TooltipContent>Wskazówki</TooltipContent>
      </Tooltip>
      <CredenzaContent aria-describedby={undefined}>
        <CredenzaHeader>
          <CredenzaTitle className="text-2xl">
            Jak korzystać z tabeli?
          </CredenzaTitle>
          <div className="[&>p]:my-2">
            <h2 className="text-lg font-bold">Wielokrotne sortowanie</h2>
            <p>
              Chcąc posortować po wielu kolumnach naraz, przytrzymaj przycisk{" "}
              <strong className="font-mono">Shift</strong> i kliknij nagłówki
              kolumn, po których chcesz posortować dane.
            </p>
            <p>
              Priorytet sortowania będzie odpowiadał kolejności klikania w
              kolejne kolumny, np.:
              <br />
              Klikając najpierw kolumnę <i>Imię</i>, a potem (z wciśniętym{" "}
              <strong className="font-mono">Shift</strong>
              -em !) kolumnę <i>Wiek</i>,
              <br />
              dane zostaną posortowane najpierw według imion, a potem według
              wieku.
            </p>
          </div>
        </CredenzaHeader>
      </CredenzaContent>
    </Credenza>
  );
}
