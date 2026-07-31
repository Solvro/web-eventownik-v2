import { FileUp } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

interface DragOverlayProps {
  hasCsvData: boolean;
}

export function DragOverlay({ hasCsvData }: DragOverlayProps) {
  const t = useTranslations("ImportParticipants");

  return (
    <motion.div
      role="status"
      aria-live="polite"
      className="bg-background/90 text-foreground pointer-events-none fixed inset-0 z-[100] grid place-items-center p-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <motion.div
        className="border-primary/50 absolute inset-3 rounded-2xl border-2 border-dashed"
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.005 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      />
      <motion.div
        className="relative flex flex-col items-center gap-3 text-center"
        initial={{ opacity: 0, y: 10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.98 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <motion.div
          className="bg-primary/10 text-primary grid size-12 place-items-center rounded-xl"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <FileUp className="size-6" aria-hidden="true" />
        </motion.div>
        <div>
          <p className="font-semibold">{t("dropTitle")}</p>
          <p className="text-muted-foreground text-sm">
            {hasCsvData
              ? t("dropReplaceDescription")
              : t("dropUploadDescription")}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
