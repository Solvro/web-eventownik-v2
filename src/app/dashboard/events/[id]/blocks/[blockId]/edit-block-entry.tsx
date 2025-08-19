"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Loader, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { updateBlock } from "@/app/dashboard/events/[id]/blocks/actions";
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
import { useToast } from "@/hooks/use-toast";
import { useUnsavedForm } from "@/hooks/use-unsaved";
import type { Block } from "@/types/blocks";

const BlockSchema = z.object({
  name: z.string().min(1, "Nazwa bloku jest wymagana"),
  capacity: z
    .union([
      z.coerce.number().min(1, "Pojemność bloku musi być większa niż 0"),
      z.literal(""),
    ])
    .optional(),
});

function EditBlockEntry({
  blockToEdit,
  eventId,
  attributeId,
}: {
  blockToEdit: Block;
  eventId: string;
  attributeId: string;
  parentId: string;
}) {
  const form = useForm<z.infer<typeof BlockSchema>>({
    resolver: zodResolver(BlockSchema),
    defaultValues: {
      name: blockToEdit.name,
      capacity: blockToEdit.capacity ?? "",
    },
  });

  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useUnsavedForm(form.formState.isDirty);

  const onSubmit = async (data: z.infer<typeof BlockSchema>) => {
    const result = await updateBlock(
      eventId,
      attributeId,
      blockToEdit.id.toString(),
      data.name,
      null,
      data.capacity === "" || data.capacity === undefined
        ? null
        : data.capacity,
    );
    if (result.success) {
      toast({
        title: "Zapisano zmiany w bloku",
      });
      form.reset();
      setOpen(false);
      setTimeout(() => {
        router.refresh();
      }, 100);
    } else {
      toast({
        title: "Nie udało się zapisać zmian w bloku!",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="eventGhost" size="icon" className="relative">
          <Edit />
          <span className="sr-only">Edytuj blok</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Edytuj blok</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa</FormLabel>
                  <FormControl>
                    <Input placeholder="Nazwa bloku" {...field} />
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
                  <FormLabel>Maksymalna liczba osób</FormLabel>
                  <FormDescription>
                    Zostaw puste jeśli chcesz aby blok miał nieskończoną ilość
                    miejsc
                  </FormDescription>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Pojemność bloku"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant="eventDefault"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <Loader className="animate-spin" />
              ) : (
                <Save />
              )}{" "}
              Zapisz
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export { EditBlockEntry };
