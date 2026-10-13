"use client";

import { Loader } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { EventForm } from "@/types/forms";

import { updateEventRegisterForm } from "./actions";

function RegistrationFormSelector({
  eventUuid,
  forms,
  registerFormUuid,
}: {
  eventUuid: string;
  forms: EventForm[];
  registerFormUuid: string;
}) {
  const t = useTranslations("EventDetails");
  const router = useRouter();
  const { toast } = useToast();
  const [selectedFormUuid, setSelectedFormUuid] = useState(registerFormUuid);
  const [isPending, startTransition] = useTransition();

  function handleChange(nextFormUuid: string) {
    const previousFormUuid = selectedFormUuid;
    setSelectedFormUuid(nextFormUuid);

    startTransition(async () => {
      const result = await updateEventRegisterForm(eventUuid, nextFormUuid);
      if (!result.success) {
        setSelectedFormUuid(previousFormUuid);
        toast({
          title: t("failedToUpdateRegistrationForm"),
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({ title: t("registrationFormUpdated") });
      router.refresh();
    });
  }

  return (
    <div className="max-w-xl space-y-2">
      <Label htmlFor="registration-form-select">{t("registrationForm")}</Label>
      <Select
        value={selectedFormUuid}
        onValueChange={handleChange}
        disabled={isPending || forms.length === 0}
      >
        <SelectTrigger id="registration-form-select">
          <SelectValue placeholder={t("selectRegistrationForm")} />
          {isPending ? <Loader className="ani`mate-spin size-4" /> : null}
        </SelectTrigger>
        <SelectContent>
          {forms.map((form) => (
            <SelectItem key={form.uuid} value={form.uuid}>
              {form.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export { RegistrationFormSelector };
