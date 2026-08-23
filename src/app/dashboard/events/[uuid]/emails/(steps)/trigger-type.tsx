"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { ArrowRight, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { newEventEmailTemplateAtom } from "@/atoms/new-email-template-atom";
import { FormContainer } from "@/components/forms/form-container";
import { TriggerTypeExplanation } from "@/components/trigger-type-explanation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
// NOTE: Input import is commented out because it's used by the attribute_changed trigger
// which is not yet implemented on the backend. Uncomment when the backend supports this feature.
// import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAutoSave } from "@/hooks/use-autosave";
import { EMAIL_TRIGGERS } from "@/lib/emails";
import type { EventAttribute } from "@/types/attributes";
import type { EventForm } from "@/types/forms";

const EventEmailTemplateTriggerTypeSchema = z
  .object({
    trigger: z.enum(
      EMAIL_TRIGGERS.map((t) => t.value) as [string, ...string[]],
    ),
    triggerValue: z.string().optional(),
    triggerValue2: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.trigger === "form_filled") {
        return data.triggerValue !== undefined && data.triggerValue !== "";
      }
      // NOTE: Commented out because this trigger is not yet implemented on the backend.
      // Uncomment when the backend supports this feature.
      // if (data.trigger === "attribute_changed") {
      //   return (
      //     (data.triggerValue !== undefined && data.triggerValue !== "") ||
      //     (data.triggerValue2 !== undefined && data.triggerValue2 !== "")
      //   );
      // }
      return true;
    },
    {
      message: "triggerRequiresConfiguration",
    },
  );

function TriggerConfigurationInputs({
  // NOTE: eventAttributes is prefixed with underscore because the attribute_changed trigger
  // which uses it is not yet implemented on the backend. Rename back when the backend supports this feature.
  eventAttributes: _eventAttributes,
  eventForms,
  trigger,
  form,
}: {
  eventAttributes: EventAttribute[];
  eventForms: EventForm[];
  trigger: string;
  form: ReturnType<
    typeof useForm<z.infer<typeof EventEmailTemplateTriggerTypeSchema>>
  >;
}) {
  const target = EMAIL_TRIGGERS.find((t) => t.value === trigger);
  const t = useTranslations("EventDetails");

  if (target === undefined) {
    return null;
  }

  switch (target.value) {
    case "participant_registered":
    case "participant_deleted":
    case "manual": {
      return (
        <p className="text-muted-foreground my-2 text-sm">
          {t("triggerNoAdditionalConfiguration")}
        </p>
      );
    }
    case "form_filled": {
      return (
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="triggerValue"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>{t("form")}</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectForm")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {eventForms.map((eventForm) => (
                      <SelectItem key={eventForm.uuid} value={eventForm.uuid}>
                        {eventForm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    }
    // NOTE: Commented out because this trigger is not yet implemented on the backend.
    // Uncomment when the backend supports this feature.
    // case "attribute_changed": {
    //   return (
    //     <div className="flex flex-col gap-2">
    //       <FormField
    //         control={form.control}
    //         name="triggerValue"
    //         render={({ field }) => (
    //           <FormItem className="space-y-3">
    //             <FormLabel>Atrybut</FormLabel>
    //             <Select onValueChange={field.onChange}>
    //               <FormControl>
    //                 <SelectTrigger>
    //                   <SelectValue placeholder="Wybierz atrybut" />
    //                 </SelectTrigger>
    //               </FormControl>
    //               <SelectContent>
    //                 {eventAttributes.map((attribute) => (
    //                   <SelectItem
    //                     key={attribute.uuid}
    //                     value={String(attribute.uuid)}
    //                   >
    //                     {attribute.name}
    //                   </SelectItem>
    //                 ))}
    //               </SelectContent>
    //             </Select>
    //             <FormMessage />
    //           </FormItem>
    //         )}
    //       />
    //       <FormField
    //         control={form.control}
    //         name="triggerValue2"
    //         render={({ field }) => (
    //           <FormItem className="space-y-3">
    //             <FormLabel>Wyzwalająca wartość atrybutu</FormLabel>
    //             <FormControl>
    //               <Input type="text" placeholder="tak" {...field} />
    //             </FormControl>
    //             <FormMessage />
    //           </FormItem>
    //         )}
    //       />
    //     </div>
    //   );
    // }
  }
}

function TriggerTypeForm({
  eventAttributes,
  eventForms,
  goToNextStep,
}: {
  eventAttributes: EventAttribute[];
  eventForms: EventForm[];
  goToNextStep: () => void;
}) {
  const t = useTranslations("EventDetails");
  const tEmailTriggers = useTranslations("EmailTriggers");

  const [newEmailTemplate, setNewEmailTemplate] = useAtom(
    newEventEmailTemplateAtom,
  );

  const form = useForm<z.infer<typeof EventEmailTemplateTriggerTypeSchema>>({
    resolver: zodResolver(EventEmailTemplateTriggerTypeSchema),
    defaultValues: {
      trigger: newEmailTemplate.trigger,
    },
  });

  useAutoSave(setNewEmailTemplate, form);

  return (
    <FormContainer
      description={t("trigger")}
      icon={<Zap />}
      step={"1/2"}
      title={t("step", { number: 1 })}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(goToNextStep)} className="space-y-8">
          <h2 className="font-semibold">{t("chooseTriggerType")}</h2>
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <FormField
              control={form.control}
              name="trigger"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex w-50 max-w-full flex-col space-y-1"
                    >
                      {EMAIL_TRIGGERS.map((trigger) => (
                        <FormItem
                          className="flex items-center space-y-0 space-x-3"
                          key={trigger.value}
                        >
                          <FormControl>
                            <RadioGroupItem
                              value={trigger.value}
                              onClick={() => {
                                form.clearErrors();
                              }}
                            />
                          </FormControl>
                          <FormLabel>{tEmailTriggers(trigger.name)}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("trigger") && (
              <TriggerTypeExplanation trigger={form.getValues("trigger")} />
            )}
          </div>
          <div className="bg-muted/25 h-px w-full" />
          <div className="flex min-h-40 flex-col gap-4">
            <h2 className="font-semibold">{t("configureTrigger")}</h2>
            <FormMessage className="text-sm text-red-500">
              {Object.keys(form.formState.errors).length > 0
                ? t("triggerRequiresConfiguration")
                : ""}
            </FormMessage>
            <div className="flex flex-col gap-8">
              <TriggerConfigurationInputs
                trigger={form.getValues("trigger")}
                eventAttributes={eventAttributes}
                eventForms={eventForms}
                form={form}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="eventGhost"
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              {t("next")} <ArrowRight />
            </Button>
          </div>
        </form>
      </Form>
    </FormContainer>
  );
}

export { TriggerTypeForm };
