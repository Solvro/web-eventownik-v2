import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  PlusIcon,
  SettingsIcon,
  Trash2,
  UploadIcon,
} from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { setEventPrimaryColors } from "@/components/event-primary-color";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAutoSave } from "@/hooks/use-autosave";
import { cn } from "@/lib/utils";

import { isSlugTaken } from "../actions";
import { FormContainer } from "../form-container";
import { eventAtom } from "../state";

// Required for usage of useFieldArray hook
/* eslint-disable @typescript-eslint/restrict-template-expressions */

const EventPersonalizationFormSchema = z.object({
  image: z.string().optional(),
  color: z.string().optional(),
  participantsNumber: z.coerce.number().min(1),
  socialMediaLinks: z.array(
    z.object({
      label: z.string().optional(),
      link: z.string().url("Nieprawidłowy URL").or(z.literal("")),
    }),
  ),
  slug: z
    .string()
    .min(3, "Slug musi mieć co najmniej 3 znaki")
    .regex(/^[a-z0-9-]+$/, "Tylko małe litery, cyfry i myślniki"),
});

export function PersonalizationForm({
  goToPreviousStep,
  goToNextStep,
}: {
  goToPreviousStep: () => void;
  goToNextStep: () => void;
}) {
  const [event, setEvent] = useAtom(eventAtom);
  const fileInputId = useId();
  const [lastImageUrl, setLastImageUrl] = useState<string>("");

  const form = useForm<z.infer<typeof EventPersonalizationFormSchema>>({
    resolver: zodResolver(EventPersonalizationFormSchema),
    defaultValues: {
      image: event.image,
      color: event.color,
      participantsNumber: event.participantsNumber,
      socialMediaLinks: event.socialMediaLinks,
      slug:
        event.slug === ""
          ? event.name.toLowerCase().replaceAll(/\s+/g, "-")
          : event.slug,
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "socialMediaLinks",
    control: form.control,
  });

  async function onSubmit(
    data: z.infer<typeof EventPersonalizationFormSchema>,
  ) {
    if (!(await form.trigger())) {
      return { success: false, event: null };
    }
    /**
     * before going to the next step,
     * we have to check if submitted slug is not already used
     */
    const slugTaken = await isSlugTaken(data.slug);
    if (slugTaken) {
      form.setError("slug", {
        message: "Ten slug jest już zajęty.",
      });
      return;
    }
    goToNextStep();
  }

  useAutoSave(setEvent, form);

  return (
    <FormContainer
      step="2/4"
      title="Krok 2"
      description="Spersonalizuj wydarzenie"
      icon={<SettingsIcon />}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-4"
        >
          <div className="grid w-full grid-cols-2 gap-4">
            <FormField
              name="image"
              control={form.control}
              render={({ field }) => {
                const processedField = { ...field, value: "" };
                return (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel>Zdjęcie</FormLabel>
                    <FormLabel
                      htmlFor={fileInputId}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "border-box flex aspect-square h-min w-full max-w-xs cursor-pointer flex-col items-center justify-center gap-1 text-neutral-500",
                        event.image !== "" && "overflow-hidden p-0",
                      )}
                    >
                      {event.image === "" ? (
                        <>
                          <div className="flex flex-row items-center gap-2">
                            <UploadIcon /> Dodaj zdjęcie
                          </div>
                          <p className="text-sm font-normal">
                            Format 1:1, zalecane 1080x1080px
                          </p>
                        </>
                      ) : (
                        <Image
                          src={event.image === "" ? "" : event.image}
                          alt="Podgląd zdjęcia wydarzenia"
                          width={1080}
                          height={1080}
                          className="rounded-md"
                        />
                      )}
                    </FormLabel>
                    <Input
                      id={fileInputId}
                      className="hidden"
                      type="file"
                      accept="image/png, image/gif, image/jpeg"
                      disabled={form.formState.isSubmitting}
                      {...processedField}
                      onChangeCapture={(event_) => {
                        const input = event_.target as HTMLInputElement;
                        if (input.files?.[0] != null) {
                          URL.revokeObjectURL(lastImageUrl);
                          const newBlobUrl = URL.createObjectURL(
                            input.files[0],
                          );
                          setLastImageUrl(newBlobUrl);
                          setEvent({
                            ...event,
                            image: newBlobUrl,
                          });
                        }
                      }}
                    />
                  </FormItem>
                );
              }}
            />
            <div className="flex flex-col gap-4">
              <FormField
                name="color"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Kolor wydarzenia</FormLabel>
                    <FormLabel
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "cursor-pointer justify-start",
                      )}
                    >
                      <span
                        className="aspect-square w-6 rounded-full"
                        style={{ backgroundColor: form.getValues("color") }}
                      />
                      <p>{form.getValues("color")}</p>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="color"
                        className="pointer-events-none absolute h-0 w-0 pb-14 opacity-0"
                        disabled={form.formState.isSubmitting}
                        {...field}
                        onChange={(event_) => {
                          setEventPrimaryColors(event_.target.value);
                          field.onChange(event_);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="participantsNumber"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Liczba uczestników</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="socialMediaLinks"
                control={form.control}
                render={() => (
                  <FormItem>
                    <FormLabel>Linki</FormLabel>
                    <div className="space-y-3">
                      {fields.map((field, index) => (
                        <div className="flex flex-col gap-2" key={field.id}>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input
                                placeholder="Facebook"
                                {...form.register(
                                  `socialMediaLinks.${index}.label` as const,
                                )}
                              />
                            </FormControl>
                            <FormControl>
                              <Input
                                type="url"
                                placeholder="https://fb.me/knsolvro"
                                {...form.register(
                                  `socialMediaLinks.${index}.link` as const,
                                )}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="shrink-0 hover:bg-red-500/90 hover:text-white"
                              onClick={() => {
                                remove(index);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {form.formState.errors.socialMediaLinks?.[index]
                            ?.label?.message != null && (
                            <p className="text-sm text-[0.8rem] font-medium text-red-500">
                              {
                                form.formState.errors.socialMediaLinks[index]
                                  .label.message
                              }
                            </p>
                          )}
                          {form.formState.errors.socialMediaLinks?.[index]?.link
                            ?.message != null && (
                            <p className="text-sm text-[0.8rem] font-medium text-red-500">
                              {
                                form.formState.errors.socialMediaLinks[index]
                                  .link.message
                              }
                            </p>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                          append({ label: "", link: "" });
                        }}
                      >
                        <PlusIcon className="h-4 w-4" />
                        Dodaj link
                      </Button>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                name="slug"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500">
                      {form.formState.errors.slug?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="flex flex-row items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={goToPreviousStep}
              disabled={form.formState.isSubmitting}
            >
              <ArrowLeft /> Wróć
            </Button>
            <Button
              className="w-min"
              variant="ghost"
              disabled={form.formState.isSubmitting}
              type="submit"
            >
              {form.formState.isSubmitting ? (
                <>
                  Zapisywanie danych... <Loader2 className="animate-spin" />
                </>
              ) : (
                <>
                  Dalej <ArrowRight />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </FormContainer>
  );
}
