import { HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function HelpDialog() {
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button size="icon" variant="outline">
              <HelpCircle />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Wskazówki</TooltipContent>
      </Tooltip>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Jak korzystać z tabeli?
          </DialogTitle>
          <div>
            <h2 className="text-lg font-bold">Wielokrotne sortowanie</h2>
            <p className="px-2 py-1">
              Chcąc posortować po wielu kolumnach naraz, trzymaj przycisk{" "}
              <b>
                <code>Shift</code>
              </b>{" "}
              i kliknij nagłówki kolumn, po których chcesz posortować dane.
              <br />
              Priorytet sortowania będzie odpowiadał kolejności klikania
              kolejnych kolumn, np.:
              <br />
              Klikając najpierw kolumnę <i>Imię</i>, a potem ( z wciśniętym{" "}
              <code>Shiftem</code>! ) kolumnę <i>Wiek</i>,
              <br />
              dane zostaną posortowane najpierw według imion, a potem według
              wieku.
            </p>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
