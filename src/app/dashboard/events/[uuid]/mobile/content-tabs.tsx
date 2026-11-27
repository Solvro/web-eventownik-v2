"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Clock, MapPin, Pencil, Phone, Plus, Save } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";
import type {
  DefaultValues,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getDateLocale } from "@/i18n/utils";
import type {
  MobileFaqItem,
  MobileScheduleItem,
  MobileSosContact,
} from "@/types/mobile";

import {
  createMobileItem,
  deleteMobileItem,
  updateMobileItem,
} from "./actions";
import {
  DeleteButton,
  EmptyState,
  SectionHeader,
  SubmitButton,
  useMobileAction,
} from "./shared";

/** Dialog with a create/edit form; the form is reset each time it opens */
function ItemDialog<T extends FieldValues>({
  title,
  trigger,
  schema,
  defaultValues,
  onSubmit,
  children,
}: {
  title: string;
  trigger: ReactNode;
  schema: z.ZodType<T>;
  defaultValues: DefaultValues<T>;
  /** Return true to close the dialog */
  onSubmit: (values: T) => Promise<boolean>;
  children: (form: UseFormReturn<T>) => ReactNode;
}) {
  const t = useTranslations("MobileAdmin");
  const [open, setOpen] = useState(false);
  const form = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
    resolver: zodResolver(schema as any),
    defaultValues,
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (isOpen) {
          form.reset(defaultValues);
        }
        setOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              if (await onSubmit(values)) {
                setOpen(false);
              }
            })}
            className="flex flex-col gap-4"
          >
            {children(form)}
            <SubmitButton
              isSubmitting={form.formState.isSubmitting}
              icon={<Save />}
            >
              {t("save")}
            </SubmitButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function TextField<T extends FieldValues>({
  form,
  name,
  label,
  multiline = false,
  type = "text",
}: {
  form: UseFormReturn<T>;
  name: Parameters<UseFormReturn<T>["register"]>[0];
  label: string;
  multiline?: boolean;
  type?: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {multiline ? (
              <Textarea
                {...field}
                value={(field.value as string | undefined) ?? ""}
                rows={4}
              />
            ) : (
              <Input
                {...field}
                value={(field.value as string | undefined) ?? ""}
                type={type}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Used as a dialog trigger: the dialog attaches its click handler and ref to
 * this component, so every extra prop has to reach the real button.
 */
function AddButton({ children, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button variant="outline" className="w-full sm:w-fit" {...props}>
      <Plus /> {children}
    </Button>
  );
}

/** Also a dialog trigger, see AddButton */
function EditButton({
  label,
  ...props
}: { label: string } & ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      className="shrink-0"
      {...props}
    >
      <Pencil />
    </Button>
  );
}

const emptyToNull = (value: string | undefined) => {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
};

// SOS ------------------------------------------------------------------------

const SosSchema = z.object({
  label: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(1).max(50),
  description: z.string().max(1000),
});
type SosValues = z.infer<typeof SosSchema>;

function SosFields({ form }: { form: UseFormReturn<SosValues> }) {
  const t = useTranslations("MobileAdmin");
  return (
    <>
      <TextField form={form} name="label" label={t("sos.label")} />
      <TextField form={form} name="phone" label={t("sos.phone")} type="tel" />
      <TextField
        form={form}
        name="description"
        label={t("sos.descriptionField")}
        multiline
      />
    </>
  );
}

function sosToPayload(values: SosValues) {
  return {
    label: values.label.trim(),
    phone: values.phone.trim(),
    description: emptyToNull(values.description),
  };
}

export function SosTab({
  eventUuid,
  items,
}: {
  eventUuid: string;
  items: MobileSosContact[];
}) {
  const t = useTranslations("MobileAdmin");
  const run = useMobileAction();
  const sorted = items.toSorted((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        title={t("sos.title")}
        description={t("sos.description")}
        action={
          <ItemDialog
            title={t("sos.add")}
            trigger={<AddButton>{t("sos.add")}</AddButton>}
            schema={SosSchema}
            defaultValues={{ label: "", phone: "", description: "" }}
            onSubmit={async (values) =>
              (await run(
                createMobileItem(eventUuid, "sos-contacts", {
                  ...sosToPayload(values),
                  order: sorted.length,
                }),
                t("saved"),
              )) !== null
            }
          >
            {(form) => <SosFields form={form} />}
          </ItemDialog>
        }
      />
      {sorted.length === 0 ? (
        <EmptyState>{t("sos.empty")}</EmptyState>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((item) => (
            <li
              key={item.uuid}
              className="flex items-start gap-3 rounded-xl border p-4"
            >
              <Phone className="mt-1 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{item.label}</p>
                <a href={`tel:${item.phone}`} className="text-sm underline">
                  {item.phone}
                </a>
                {item.description === null ? null : (
                  <p className="text-muted-foreground text-sm whitespace-pre-line">
                    {item.description}
                  </p>
                )}
              </div>
              <ItemDialog
                title={t("sos.edit")}
                trigger={
                  <EditButton label={t("editItem", { name: item.label })} />
                }
                schema={SosSchema}
                defaultValues={{
                  label: item.label,
                  phone: item.phone,
                  description: item.description ?? "",
                }}
                onSubmit={async (values) =>
                  (await run(
                    updateMobileItem(
                      eventUuid,
                      "sos-contacts",
                      item.uuid,
                      sosToPayload(values),
                    ),
                    t("saved"),
                  )) !== null
                }
              >
                {(form) => <SosFields form={form} />}
              </ItemDialog>
              <DeleteButton
                label={t("deleteItem", { name: item.label })}
                onConfirm={async () =>
                  run(
                    deleteMobileItem(eventUuid, "sos-contacts", item.uuid),
                    t("deleted"),
                  )
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// FAQ ------------------------------------------------------------------------

const FaqSchema = z.object({
  question: z.string().trim().min(1).max(500),
  answer: z.string().trim().min(1).max(5000),
});
type FaqValues = z.infer<typeof FaqSchema>;

function FaqFields({ form }: { form: UseFormReturn<FaqValues> }) {
  const t = useTranslations("MobileAdmin");
  return (
    <>
      <TextField form={form} name="question" label={t("faq.question")} />
      <TextField form={form} name="answer" label={t("faq.answer")} multiline />
    </>
  );
}

function faqToPayload(values: FaqValues) {
  return {
    question: values.question.trim(),
    answer: values.answer.trim(),
  };
}

export function FaqTab({
  eventUuid,
  items,
}: {
  eventUuid: string;
  items: MobileFaqItem[];
}) {
  const t = useTranslations("MobileAdmin");
  const run = useMobileAction();
  const sorted = items.toSorted((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        title={t("faq.title")}
        description={t("faq.description")}
        action={
          <ItemDialog
            title={t("faq.add")}
            trigger={<AddButton>{t("faq.add")}</AddButton>}
            schema={FaqSchema}
            defaultValues={{ question: "", answer: "" }}
            onSubmit={async (values) =>
              (await run(
                createMobileItem(eventUuid, "faq", {
                  ...faqToPayload(values),
                  order: sorted.length,
                }),
                t("saved"),
              )) !== null
            }
          >
            {(form) => <FaqFields form={form} />}
          </ItemDialog>
        }
      />
      {sorted.length === 0 ? (
        <EmptyState>{t("faq.empty")}</EmptyState>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((item) => (
            <li
              key={item.uuid}
              className="flex items-start gap-3 rounded-xl border p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{item.question}</p>
                <p className="text-muted-foreground text-sm whitespace-pre-line">
                  {item.answer}
                </p>
              </div>
              <ItemDialog
                title={t("faq.edit")}
                trigger={
                  <EditButton label={t("editItem", { name: item.question })} />
                }
                schema={FaqSchema}
                defaultValues={{
                  question: item.question,
                  answer: item.answer,
                }}
                onSubmit={async (values) =>
                  (await run(
                    updateMobileItem(
                      eventUuid,
                      "faq",
                      item.uuid,
                      faqToPayload(values),
                    ),
                    t("saved"),
                  )) !== null
                }
              >
                {(form) => <FaqFields form={form} />}
              </ItemDialog>
              <DeleteButton
                label={t("deleteItem", { name: item.question })}
                onConfirm={async () =>
                  run(
                    deleteMobileItem(eventUuid, "faq", item.uuid),
                    t("deleted"),
                  )
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Schedule -------------------------------------------------------------------

const DATETIME_LOCAL_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

const ScheduleSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().max(2000),
    location: z.string().max(200),
    startsAt: z.string().regex(DATETIME_LOCAL_REGEX),
    endsAt: z.union([z.literal(""), z.string().regex(DATETIME_LOCAL_REGEX)]),
  })
  .refine(
    (values) =>
      values.endsAt === "" ||
      new Date(values.endsAt).getTime() > new Date(values.startsAt).getTime(),
    { path: ["endsAt"], message: "End must be after start" },
  );
type ScheduleValues = z.infer<typeof ScheduleSchema>;

/** ISO string -> value for <input type="datetime-local"> in local time */
function toLocalInput(iso: string | null) {
  if (iso === null) {
    return "";
  }
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : format(date, "yyyy-MM-dd'T'HH:mm");
}

function ScheduleFields({ form }: { form: UseFormReturn<ScheduleValues> }) {
  const t = useTranslations("MobileAdmin");
  return (
    <>
      <TextField form={form} name="title" label={t("schedule.titleField")} />
      <TextField form={form} name="location" label={t("schedule.location")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          form={form}
          name="startsAt"
          label={t("schedule.startsAt")}
          type="datetime-local"
        />
        <TextField
          form={form}
          name="endsAt"
          label={t("schedule.endsAt")}
          type="datetime-local"
        />
      </div>
      <TextField
        form={form}
        name="description"
        label={t("schedule.descriptionField")}
        multiline
      />
    </>
  );
}

function scheduleToPayload(values: ScheduleValues) {
  return {
    title: values.title.trim(),
    description: emptyToNull(values.description),
    location: emptyToNull(values.location),
    startsAt: new Date(values.startsAt).toISOString(),
    endsAt: values.endsAt === "" ? null : new Date(values.endsAt).toISOString(),
  };
}

export function ScheduleTab({
  eventUuid,
  items,
}: {
  eventUuid: string;
  items: MobileScheduleItem[];
}) {
  const t = useTranslations("MobileAdmin");
  const locale = useLocale();
  const run = useMobileAction();
  const sorted = items.toSorted(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );

  const formatDate = (iso: string) =>
    format(new Date(iso), "EEE d MMM, HH:mm", {
      locale: getDateLocale(locale),
    });

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        title={t("schedule.title")}
        description={t("schedule.description")}
        action={
          <ItemDialog
            title={t("schedule.add")}
            trigger={<AddButton>{t("schedule.add")}</AddButton>}
            schema={ScheduleSchema}
            defaultValues={{
              title: "",
              description: "",
              location: "",
              startsAt: "",
              endsAt: "",
            }}
            onSubmit={async (values) =>
              (await run(
                createMobileItem(
                  eventUuid,
                  "schedule",
                  scheduleToPayload(values),
                ),
                t("saved"),
              )) !== null
            }
          >
            {(form) => <ScheduleFields form={form} />}
          </ItemDialog>
        }
      />
      {sorted.length === 0 ? (
        <EmptyState>{t("schedule.empty")}</EmptyState>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((item) => (
            <li
              key={item.uuid}
              className="flex items-start gap-3 rounded-xl border p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{item.title}</p>
                <p className="text-muted-foreground flex items-center gap-1 text-sm">
                  <Clock className="size-4" />
                  {formatDate(item.startsAt)}
                  {item.endsAt === null
                    ? null
                    : ` – ${formatDate(item.endsAt)}`}
                </p>
                {item.location === null ? null : (
                  <p className="text-muted-foreground flex items-center gap-1 text-sm">
                    <MapPin className="size-4" />
                    {item.location}
                  </p>
                )}
                {item.description === null ? null : (
                  <p className="mt-1 text-sm whitespace-pre-line">
                    {item.description}
                  </p>
                )}
              </div>
              <ItemDialog
                title={t("schedule.edit")}
                trigger={
                  <EditButton label={t("editItem", { name: item.title })} />
                }
                schema={ScheduleSchema}
                defaultValues={{
                  title: item.title,
                  description: item.description ?? "",
                  location: item.location ?? "",
                  startsAt: toLocalInput(item.startsAt),
                  endsAt: toLocalInput(item.endsAt),
                }}
                onSubmit={async (values) =>
                  (await run(
                    updateMobileItem(
                      eventUuid,
                      "schedule",
                      item.uuid,
                      scheduleToPayload(values),
                    ),
                    t("saved"),
                  )) !== null
                }
              >
                {(form) => <ScheduleFields form={form} />}
              </ItemDialog>
              <DeleteButton
                label={t("deleteItem", { name: item.title })}
                onConfirm={async () =>
                  run(
                    deleteMobileItem(eventUuid, "schedule", item.uuid),
                    t("deleted"),
                  )
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
