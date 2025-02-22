"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SettingsIcon, UploadIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useState } from "react";
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

const EventPersonalizationFormSchema = z.object({
  image: z.string().optional(),
  color: z.string().optional(),
  links: z.array(z.string()),
  slug: z.string(),
});

export default function EventPersonalizationForm() {
  const fileInputId = useId();
  const imageInputId = useId();
  const [eventImage, setEventImage] = useState<string | null>(null);
  const form = useForm<z.infer<typeof EventPersonalizationFormSchema>>({
    resolver: zodResolver(EventPersonalizationFormSchema),
    defaultValues: {
      image: "",
      color: "#3672fd",
      links: [],
      slug: "",
    },
  });
  function onSubmit(data: z.infer<typeof EventPersonalizationFormSchema>) {
    console.log(data);
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
                      "border-box flex aspect-square h-full w-full max-w-xs cursor-pointer flex-col items-center justify-center gap-1 text-neutral-500",
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
                    onChangeCapture={(event) => {
                      const input = event.target as HTMLInputElement;
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
            </div>
          </div>
        </form>
      </Form>
    </FormContainer>
  );
}
