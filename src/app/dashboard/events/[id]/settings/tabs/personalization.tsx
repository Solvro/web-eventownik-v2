import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, TrashIcon, UploadIcon } from "lucide-react";
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

import type { TabProps } from "./tab-props";

// Required for usage of useFieldArray hook
/* eslint-disable @typescript-eslint/restrict-template-expressions */

const EventPersonalizationFormSchema = z.object({
  photoUrl: z.string().optional(),
  primaryColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Nieprawidłowy format koloru"),
  participantsCount: z.coerce
    .number()
    .min(1, "Musi być co najmniej 1 uczestnik"),
  socialMediaLinks: z.array(
    z.object({
      value: z.string().url("Nieprawidłowy URL").or(z.literal("")),
    }),
  ),
  slug: z
    .string()
    .min(3, "Slug musi mieć co najmniej 3 znaki")
    .regex(/^[a-z0-9-]+$/, "Tylko małe litery, cyfry i myślniki"),
});

export function Personalization({ event, saveFormRef }: TabProps) {
  const imageInputId = useId();
  const colorInputId = useId();
  const slugInputId = useId();
  const [lastImageUrl, setLastImageUrl] = useState<string>(
    event.photoUrl ?? "",
  );

  const form = useForm<z.infer<typeof EventPersonalizationFormSchema>>({
    resolver: zodResolver(EventPersonalizationFormSchema),
    defaultValues: {
      photoUrl: event.photoUrl ?? "",
      primaryColor: event.primaryColor,
      participantsCount: event.participantsCount ?? undefined,
      socialMediaLinks:
        event.socialMediaLinks?.map((link) => ({
          value: link,
        })) ?? [],
      slug: event.slug,
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "socialMediaLinks",
    control: form.control,
  });

  async function saveForm() {
    if (!(await form.trigger())) {
      return { success: false, event: null };
    }
    const values = form.getValues();
    const newEvent = {
      ...event,
      photoUrl: lastImageUrl,
      primaryColor: values.primaryColor,
      participantsCount: values.participantsCount,
      socialMediaLinks: values.socialMediaLinks.map((link) => link.value),
      slug: values.slug,
    };
    return { success: true, event: newEvent };
  }

  saveFormRef.current = saveForm;

  return (
    <Form {...form}>
      <form className="flex w-full flex-row flex-wrap gap-4">
        <div className="w-full space-y-4 sm:min-w-80">
          <FormField
            name="photoUrl"
            control={form.control}
            render={({ field }) => {
              const processedField = { ...field, value: "" };
              return (
                <FormItem className="flex w-full flex-col">
                  <FormLabel htmlFor={imageInputId}>Zdjęcie</FormLabel>
                  <FormLabel
                    htmlFor={imageInputId}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "border-box flex aspect-square h-min w-full cursor-pointer flex-col items-center justify-center gap-1 text-neutral-500 sm:max-w-xs",
                      lastImageUrl !== "" && "overflow-hidden p-0",
                    )}
                  >
                    {lastImageUrl === "" ? (
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
                        src={
                          lastImageUrl.startsWith("blob:")
                            ? lastImageUrl
                            : `${process.env.NEXT_PUBLIC_PHOTO_URL}/${lastImageUrl}`
                        }
                        width={1000}
                        height={1000}
                        alt="Podgląd zdjęcia wydarzenia"
                        className="h-full rounded-md object-cover"
                      />
                    )}
                  </FormLabel>
                  <Input
                    id={imageInputId}
                    className="hidden"
                    type="file"
                    accept="image/png, image/gif, image/jpeg"
                    disabled={form.formState.isSubmitting}
                    {...processedField}
                    onChangeCapture={(event_) => {
                      const input = event_.target as HTMLInputElement;
                      if (input.files?.[0] != null) {
                        if (lastImageUrl.startsWith("blob:")) {
                          URL.revokeObjectURL(lastImageUrl);
                        }
                        const newBlobUrl = URL.createObjectURL(input.files[0]);
                        setLastImageUrl(newBlobUrl);
                      }
                    }}
                  />
                  <FormMessage className="text-sm text-red-500">
                    {form.formState.errors.photoUrl?.message}
                  </FormMessage>
                </FormItem>
              );
            }}
          />
          <FormField
            name="participantsCount"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Liczba uczestników</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Podaj liczbę uczestników"
                    disabled={form.formState.isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-500">
                  {form.formState.errors.participantsCount?.message}
                </FormMessage>
              </FormItem>
            )}
          />
        </div>
        <div className="w-full space-y-4 sm:min-w-80">
          <FormField
            name="primaryColor"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel htmlFor={colorInputId}>Kolor wydarzenia</FormLabel>
                <FormLabel
                  htmlFor={colorInputId}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "cursor-pointer justify-start",
                  )}
                >
                  <span
                    className="aspect-square w-6 rounded-full"
                    style={{ backgroundColor: form.getValues("primaryColor") }}
                  />
                  <p>{form.getValues("primaryColor")}</p>
                </FormLabel>
                <FormControl>
                  <Input
                    type="color"
                    className="pointer-events-none absolute h-0 w-0 pb-14 opacity-0"
                    id={colorInputId}
                    disabled={form.formState.isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-500">
                  {form.formState.errors.primaryColor?.message}
                </FormMessage>
              </FormItem>
            )}
          />
          <FormField
            name="slug"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel htmlFor={slugInputId}>
                  Slug{" "}
                  <span className="text-neutral-500">
                    (eventownik.solvro.pl/...)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="twoje-wydarzenie"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-500">
                  {form.formState.errors.slug?.message}
                </FormMessage>
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
                            type="url"
                            placeholder="https://tiktok.com/@antonio_._banderas"
                            {...form.register(
                              `socialMediaLinks.${index}.value` as const,
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
                      {form.formState.errors.socialMediaLinks?.[index]?.value
                        ?.message != null && (
                        <p className="text-sm text-[0.8rem] font-medium text-red-500">
                          {
                            form.formState.errors.socialMediaLinks[index].value
                              .message
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
        </div>
      </form>
    </Form>
  );
}
