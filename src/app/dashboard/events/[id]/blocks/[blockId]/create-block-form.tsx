"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, SquarePlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createBlock } from "@/app/dashboard/events/[id]/blocks/actions";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UnsavedChangesAlert } from "@/components/unsaved-changes-alert";
import { useToast } from "@/hooks/use-toast";
import { useUnsavedForm } from "@/hooks/use-unsaved";

const BlockSchema = z.object({
  name: z.string().min(1, "Nazwa bloku jest wymagana"),
  capacity: z
    .union([
      z.coerce.number().min(1, "Pojemność bloku musi być większa niż 0"),
      z.literal(""),
    ])
    .optional(),
});

function CreateBlockForm({
  eventId,
  attributeId,
  parentId,
}: {
  eventId: string;
  attributeId: string;
  parentId: string;
}) {
  const t = useTranslations("EventDetails");
  const form = useForm<z.infer<typeof BlockSchema>>({
    resolver: zodResolver(BlockSchema),
    defaultValues: {
      name: "",
      capacity: "",
    },
  });
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertActive, setAlertActive] = useState(false);
  const router = useRouter();

  const { isGuardActive, onCancel, onConfirm } = useUnsavedForm(
    form.formState.isDirty,
  );

  const onSubmit = async (data: z.infer<typeof BlockSchema>) => {
    const result = await createBlock(
      eventId,
      attributeId,
      parentId,
      data.name,
      null,
      data.capacity === "" || data.capacity === undefined
        ? null
        : data.capacity,
    );
    if (result.success) {
      toast({
        title: t("newBlockCreated"),
      });
      form.reset();
      setDialogOpen(false);
      setTimeout(() => {
        router.refresh();
      }, 100);
    } else {
      toast({
        title: t("failedToCreateBlock"),
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open: boolean) => {
        if (open) {
          setDialogOpen(open);
        } else {
          if (form.formState.isDirty || isGuardActive) {
            setAlertActive(form.formState.isDirty || isGuardActive);
          } else {
            setDialogOpen(open);
          }
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full lg:w-fit">
          <SquarePlus className="h-6 w-6" /> {t("createBlock")}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>{t("createBlock")}</DialogTitle>
        </DialogHeader>
        <UnsavedChangesAlert
          active={alertActive}
          setActive={setAlertActive}
          setDialogOpen={setDialogOpen}
          onCancel={onCancel}
          onConfirm={() => {
            form.reset();
            onConfirm();
          }}
        />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("blockName")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("maxParticipants")}</FormLabel>
                  <FormDescription>
                    {t("leaveEmptyForUnlimited")}
                  </FormDescription>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t("blockCapacity")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              variant="eventDefault"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader className="animate-spin" /> {t("creatingBlock")}
                </>
              ) : (
                t("createBlock")
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export { CreateBlockForm };
