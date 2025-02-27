"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import {
  ArrowRight,
  Loader2,
  MinusIcon,
  PlusIcon,
  SettingsIcon,
  UploadIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { FormContainer } from "../form-container";
import { eventAtom } from "../state";

const EventPersonalizationFormSchema = z.object({
  image: z.string().optional(),
  color: z.string().optional(),
  participantsNumber: z.number().min(1),
  links: z.array(z.string()),
  slug: z.string(),
});

export function PersonalizationForm() {
  const router = useRouter();
  const [event, setEvent] = useAtom(eventAtom);
  if (event.name === "") {
    router.push("/dashboard/event/create?step=1");
  }
  const fileInputId = useId();
  const imageInputId = useId();
  const [eventImage, setEventImage] = useState<string | null>(null);
  const form = useForm<z.infer<typeof EventPersonalizationFormSchema>>({
    resolver: zodResolver(EventPersonalizationFormSchema),
    defaultValues: {
      image: event.image,
      color: event.color,
      participantsNumber: event.participantsNumber,
      links: event.links,
      slug: `/${event.name.toLowerCase().replaceAll(/\s+/g, "-")}`,
    },
  });
  async function onSubmit(
    data: z.infer<typeof EventPersonalizationFormSchema>,
  ) {
    let image = "";
    if (eventImage !== null) {
      // convert image to base64
      image = await new Promise((resolve) => {
        // Fetch the Blob from the Blob URL
        void fetch(eventImage)
          .then(async (response) => response.blob()) // Get the Blob from the URL
          .then((blob) => {
            // Use FileReader to read the Blob as a base64 string
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result as string); // This will be a base64 string
            };
            reader.readAsDataURL(blob); // Read Blob as a Data URL (base64)
          });
      });
    }
    console.log(image);
    setEvent({
      ...event,
      image,
      color: data.color ?? "#3672fd",
      participantsNumber: data.participantsNumber,
      links: data.links,
      slug: data.slug,
    });
    router.push("/dashboard/event/create?step=3");
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
              disabled={form.formState.isSubmitting}
              render={({ field }) => (
                <FormItem className="flex w-full flex-col gap-2">
                  <FormLabel>Zdjęcie</FormLabel>
                  <FormLabel
                    htmlFor={fileInputId}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "border-box flex aspect-square h-min w-full max-w-xs cursor-pointer flex-col items-center justify-center gap-1 text-neutral-500",
                      eventImage !== null && "overflow-hidden p-0",
                    )}
                  >
                    {eventImage === null ? (
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
                        src={eventImage}
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
                    {...field}
                    onChangeCapture={(event_) => {
                      const input = event_.target as HTMLInputElement;
                      if (input.files?.[0] != null) {
                        setEventImage(URL.createObjectURL(input.files[0]));
                      }
                    }}
                  />
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-4">
              <FormField
                name="color"
                control={form.control}
                disabled={form.formState.isSubmitting}
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
                disabled={form.formState.isSubmitting}
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
                disabled={form.formState.isSubmitting}
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>Linki</FormLabel>
                    {form.getValues("links").map((link) => {
                      const linkId = form.getValues("links").indexOf(link);
                      return (
                        <div className="flex flex-row gap-2" key={linkId}>
                          <Input
                            type="url"
                            placeholder="https://"
                            disabled={form.formState.isSubmitting}
                            value={link}
                            onChange={(_event) => {
                              const newLinks = [...form.getValues("links")];
                              newLinks[linkId] = _event.target.value;
                              form.setValue("links", newLinks);
                            }}
                          />
                          <Button
                            type="button"
                            title="Usuń link"
                            variant="outline"
                            onClick={() => {
                              const newLinks = [...form.getValues("links")];
                              newLinks.splice(linkId, 1);
                              form.setValue("links", newLinks);
                            }}
                          >
                            <MinusIcon />
                          </Button>
                        </div>
                      );
                    })}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        form.setValue("links", [
                          ...form.getValues("links"),
                          "",
                        ]);
                      }}
                    >
                      <PlusIcon />
                      Dodaj link
                    </Button>
                    <FormControl>
                      <Input
                        type="hidden"
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="slug"
                control={form.control}
                disabled={form.formState.isSubmitting}
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
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="flex flex-row items-center justify-between gap-4">
            <Link
              className={buttonVariants({ variant: "ghost" })}
              href="/dashboard/event/create?step=3"
            >
              Może później
            </Link>
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
