import { Download, PlusIcon, Trash2, UploadIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useId } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { z } from "zod";

import { setEventPrimaryColors } from "@/components/event-primary-color";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Required for usage of useFieldArray hook
/* eslint-disable @typescript-eslint/restrict-template-expressions */

export const EventPersonalizationFormSchema = z.object({
  photoUrl: z.string().nullish(),
  primaryColor: z.string().nullable(),
  participantsNumber: z.coerce.number().min(1),
  termsLink: z
    .string()
    .url("Wprowadź prawidłowy link do regulaminu, w tym fragment z 'https://'")
    .optional()
    .or(z.literal("")),
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

export function PersonalizationForm({ className }: { className?: string }) {
  const { control, formState, getValues, register, setValue, watch } =
    useFormContext<z.infer<typeof EventPersonalizationFormSchema>>();
  const fileInputId = useId();

  const { fields, append, remove } = useFieldArray({
    name: "socialMediaLinks",
    control,
  });

  const imageValue = watch("photoUrl");

  return (
    <div className={cn("grid w-full gap-4 md:grid-cols-2", className)}>
      <FormField
        name="photoUrl"
        control={control}
        render={({ field }) => {
          const processedField = { ...field, value: "" };
          return (
            <FormItem className="flex w-full flex-col">
              <FormLabel>Zdjęcie</FormLabel>
              <FormLabel
                htmlFor={fileInputId}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "border-box flex aspect-square h-min w-full cursor-pointer flex-col items-center justify-center gap-1 text-neutral-500",
                  imageValue != null &&
                    imageValue !== "" &&
                    "overflow-hidden p-0",
                )}
              >
                {imageValue == null || imageValue === "" ? (
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
                      imageValue.startsWith("blob:")
                        ? imageValue
                        : `${process.env.NEXT_PUBLIC_PHOTO_URL}/${imageValue}`
                    }
                    alt="Podgląd zdjęcia wydarzenia"
                    width={1080}
                    height={1080}
                    className="h-full rounded-md object-cover"
                  />
                )}
              </FormLabel>
              <Input
                id={fileInputId}
                className="hidden"
                type="file"
                accept="image/png, image/gif, image/jpeg"
                disabled={formState.isSubmitting}
                {...processedField}
                onChange={(event_) => {
                  const input = event_.target as HTMLInputElement;
                  if (input.files?.[0] != null) {
                    const currentImage = getValues("photoUrl");
                    if (currentImage?.startsWith("blob:") === true) {
                      URL.revokeObjectURL(currentImage);
                    }
                    const newBlobUrl = URL.createObjectURL(input.files[0]);
                    setValue("photoUrl", newBlobUrl);
                    field.onChange(newBlobUrl);
                  }
                }}
              />
            </FormItem>
          );
        }}
      />
      <div className="grid gap-4">
        <FormField
          name="primaryColor"
          control={control}
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2 space-y-0">
              <FormLabel>Kolor wydarzenia</FormLabel>
              <FormLabel
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "cursor-pointer justify-start",
                )}
              >
                <span
                  className="aspect-square w-6 rounded-full"
                  style={{
                    backgroundColor: getValues("primaryColor") ?? "#3672fd",
                  }}
                />
                <p>{getValues("primaryColor")}</p>
              </FormLabel>
              <FormControl>
                <Input
                  type="color"
                  className="pointer-events-none absolute h-0 w-0 pb-14 opacity-0"
                  disabled={formState.isSubmitting}
                  {...field}
                  value={field.value ?? "#3672fd"}
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
          control={control}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Liczba uczestników</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  disabled={formState.isSubmitting}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="space-y-1">
          <FormField
            name="termsLink"
            control={control}
            render={({ field }) => (
              <FormItem className="flex flex-col flex-wrap">
                <FormLabel>Link do regulaminu</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    disabled={formState.isSubmitting}
                    placeholder="Wklej publiczny link do regulaminu (np. na Google Drive)"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-500">
                  {formState.errors.termsLink?.message}
                </FormMessage>
              </FormItem>
            )}
          />
          <Button asChild variant="eventGhost" size="sm" className="px-2">
            <Link
              href="/regulamin-wydarzenia-dla-uczestnika-wzor.docx"
              download
              target="_blank"
              className="whitespace-pre-wrap"
            >
              <Download className="size-3" />
              Pobierz szablon współtworzony z Działem Prawnym PWr
            </Link>
          </Button>
        </div>
        <FormField
          name="socialMediaLinks"
          control={control}
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
                          aria-label={`Social media label ${index}`}
                          {...register(
                            `socialMediaLinks.${index}.label` as const,
                          )}
                        />
                      </FormControl>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://fb.me/knsolvro"
                          aria-label={`Social media link ${index}`}
                          {...register(
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
                        aria-label={`Remove social media link ${index}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {formState.errors.socialMediaLinks?.[index]?.label
                      ?.message != null && (
                      <p className="text-sm text-[0.8rem] font-medium text-red-500">
                        {formState.errors.socialMediaLinks[index].label.message}
                      </p>
                    )}
                    {formState.errors.socialMediaLinks?.[index]?.link
                      ?.message != null && (
                      <p
                        className="text-sm text-[0.8rem] font-medium text-red-500"
                        data-testid={`social-media-link-error-${index.toString()}`}
                      >
                        {formState.errors.socialMediaLinks[index].link.message}
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
          control={control}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>
                Slug{" "}
                <span className="text-neutral-500">
                  (eventownik.solvro.pl/...)
                </span>
              </FormLabel>
              <FormControl>
                <Input type="text" placeholder="twoje-wydarzenie" {...field} />
              </FormControl>
              <FormMessage className="text-sm text-red-500">
                {formState.errors.slug?.message}
              </FormMessage>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
