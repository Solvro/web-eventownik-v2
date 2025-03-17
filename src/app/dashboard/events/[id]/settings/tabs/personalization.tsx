// WiP - Work in Progress
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, UploadIcon } from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import EventPhotoPlaceholder from "@/../public/event-photo-placeholder.png";
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

import type { TabProps } from "./tab-props";

const EventPersonalizationFormSchema = z.object({
  image: z.string().optional(),
  color: z.string().optional(),
  participantsNumber: z.coerce.number().min(1),
  links: z.array(z.string()),
  slug: z.string(),
});

export function Personalization({ event, setEvent, saveFormRef }: TabProps) {
  const fileInputId = useId();
  const imageInputId = useId();
  const [lastImageUrl, setLastImageUrl] = useState<string>("");

  const form = useForm<z.infer<typeof EventPersonalizationFormSchema>>({
    resolver: zodResolver(EventPersonalizationFormSchema),
    defaultValues: {
      image: event.photoUrl ?? "",
      // color: event.color,
      // participantsNumber: event.participantsNumber,
      // links: event.links,
      slug: event.name.toLowerCase().replaceAll(/\s+/g, "-"),
    },
  });
  return (
    <Form {...form}>
      <form className="flex w-full flex-col gap-4">
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
                      event.photoUrl !== "" && "overflow-hidden p-0",
                    )}
                  >
                    {event.photoUrl === "" ? (
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
                          event.photoUrl === null || event.photoUrl === ""
                            ? EventPhotoPlaceholder
                            : event.photoUrl
                        }
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
                        const newBlobUrl = URL.createObjectURL(input.files[0]);
                        setLastImageUrl(newBlobUrl);
                        setEvent({
                          ...event,
                          photoUrl: newBlobUrl,
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
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel>Linki</FormLabel>
                  {/*{form.getValues("links").map((link) => {*/}
                  {/*  const linkId = form.getValues("links").indexOf(link);*/}
                  {/*  return (*/}
                  {/*    <div className="flex flex-row gap-2" key={linkId}>*/}
                  {/*      <Input*/}
                  {/*        type="url"*/}
                  {/*        placeholder="https://"*/}
                  {/*        disabled={form.formState.isSubmitting}*/}
                  {/*        value={link}*/}
                  {/*        onChange={(_event) => {*/}
                  {/*          const newLinks = [...form.getValues("links")];*/}
                  {/*          newLinks[linkId] = _event.target.value;*/}
                  {/*          form.setValue("links", newLinks);*/}
                  {/*        }}*/}
                  {/*      />*/}
                  {/*      <Button*/}
                  {/*        type="button"*/}
                  {/*        title="Usuń link"*/}
                  {/*        disabled={form.formState.isSubmitting}*/}
                  {/*        variant="outline"*/}
                  {/*        onClick={() => {*/}
                  {/*          const newLinks = [...form.getValues("links")];*/}
                  {/*          newLinks.splice(linkId, 1);*/}
                  {/*          form.setValue("links", newLinks);*/}
                  {/*        }}*/}
                  {/*      >*/}
                  {/*        <MinusIcon />*/}
                  {/*      </Button>*/}
                  {/*    </div>*/}
                  {/*  );*/}
                  {/*})}*/}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.setValue("links", [...form.getValues("links"), ""]);
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
      </form>
    </Form>
  );
}
