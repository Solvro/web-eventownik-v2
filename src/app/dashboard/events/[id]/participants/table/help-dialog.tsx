import { HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("Table");

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
        <TooltipContent>{t("helpTooltip")}</TooltipContent>
      </Tooltip>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-2xl">{t("helpTitle")}</DialogTitle>
          <div className="[&>p]:my-2">
            <h2 className="text-lg font-bold">{t("helpMultiSortTitle")}</h2>
            <p>
              {t.rich("helpMultiSortDescription1", {
                strong: (chunks) => (
                  <strong className="font-mono">{chunks}</strong>
                ),
              })}
            </p>
            <p>
              {t.rich("helpMultiSortDescription2", {
                br: () => <br />,
                i: (chunks) => <i>{chunks}</i>,
                strong: (chunks) => (
                  <strong className="font-mono">{chunks}</strong>
                ),
              })}
            </p>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
