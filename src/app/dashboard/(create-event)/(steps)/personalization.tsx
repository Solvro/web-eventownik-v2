"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  MinusIcon,
  PlusIcon,
  SettingsIcon,
  TrashIcon,
  UploadIcon,
} from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

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
import { cn } from "@/lib/utils";

import { isSlugTaken } from "../actions";
import { FormContainer } from "../form-container";
import { eventAtom } from "../state";

const EventPersonalizationFormSchema = z.object({
  image: z.string().optional(),
  color: z.string().optional(),
  participantsNumber: z.coerce.number().min(1),
  links: z.array(
    z.object({
      value: z.string().url("Nieprawidłowy URL").or(z.literal("")),
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
  const imageInputId = useId();
  const [lastImageUrl, setLastImageUrl] = useState<string>("");

  const form = useForm<z.infer<typeof EventPersonalizationFormSchema>>({
    resolver: zodResolver(EventPersonalizationFormSchema),
    defaultValues: {
      image: event.image,
      color: event.color,
      participantsNumber: event.participantsNumber,
      links: event.links.map((link) => ({
        value: link,
      })),
      slug:
        event.slug === ""
          ? event.name.toLowerCase().replaceAll(/\s+/g, "-")
          : event.slug,
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "links",
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
    setEvent({
      ...event,
      image: event.image,
      color: data.color ?? "#3672fd",
      participantsNumber: data.participantsNumber,
      links: data.links.map((link) => link.value),
      slug: data.slug,
    });
    goToNextStep();
  }

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
                  <FormItem className="flex w-full flex-col gap-2">
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
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>Kolor wydarzenia</FormLabel>
                    <FormLabel
                      htmlFor={imageInputId}
                      className={cn(buttonVariants({ variant: "outline" }))}
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
                        className="hidden"
                        id={imageInputId}
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="participantsNumber"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
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
                name="links"
                control={form.control}
                render={() => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>Linki</FormLabel>
                    <div className="space-y-2">
                      {fields.map((field, index) => (
                        <div className="flex flex-col gap-2" key={field.id}>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input
                                type="url"
                                placeholder=""
                                {...form.register(
                                  `links.${index}.value` as const,
                                )}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="hover:bg-red-500/90 hover:text-white"
                              onClick={() => {
                                remove(index);
                              }}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                          {form.formState.errors.links?.[index]?.value
                            ?.message != null && (
                            <p className="text-sm text-[0.8rem] font-medium text-red-500">
                              {form.formState.errors.links[index].value.message}
                            </p>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => {
                          append({ value: "" });
                        }}
                      >
                        <PlusIcon className="h-4 w-4" />
                        Dodaj Linka
                      </Button>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                name="slug"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
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
