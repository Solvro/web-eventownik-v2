import { useTranslations } from "next-intl";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function UnsavedChangesAlert({
  active,
  setActive,
  setDialogOpen,
  onCancel,
  onConfirm,
}: {
  active: boolean;
  setActive?: React.Dispatch<React.SetStateAction<boolean>>;
  setDialogOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const t = useTranslations("Dashboard");

  return (
    <AlertDialog open={active} onOpenChange={setActive}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("areYouSure")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("unsavedChangesWarning")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              setDialogOpen?.(false);
              onConfirm();
            }}
          >
            {t("discardChanges")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
