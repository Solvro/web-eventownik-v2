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
  return (
    <AlertDialog open={active} onOpenChange={setActive}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Czy jesteś pewien?</AlertDialogTitle>
          <AlertDialogDescription>
            Masz niezapisane zmiany. Kontynuacja spowoduje ich utratę.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Anuluj</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              setDialogOpen?.(false);
              onConfirm();
            }}
          >
            Tak, odrzucam zmiany
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
