"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, SquarePlus } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

const BlockSchema = z.object({
  name: z.string().min(1, "Nazwa bloku jest wymagana"),
  capacity: z
    .union([
      z.coerce.number().min(1, "Pojemność bloku musi być większa niż 0"),
      z.literal(""),
    ])
    .optional(),
});

function AddBlockEntry({
  eventId,
  attributeId,
  parentId,
}: {
  eventId: string;
  attributeId: string;
  parentId: string;
}) {
  const form = useForm<z.infer<typeof BlockSchema>>({
    resolver: zodResolver(BlockSchema),
    defaultValues: {
      name: "",
      capacity: "",
    },
  });
  const { toast } = useToast();

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
        title: "Pomyślnie utworzono blok",
      });
      location.reload();
    } else {
      toast({
        title: "Wystąpił błąd",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="border-muted text-muted-foreground flex h-64 w-64 items-center justify-center gap-2 rounded-md border border-dotted p-4">
          <SquarePlus className="h-6 w-6" /> Stwórz blok
        </button>
      </DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Stwórz blok</DialogTitle>
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
              className="w-full"
              variant="eventDefault"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader className="animate-spin" /> Tworzenie bloku...
                </>
              ) : (
                "Stwórz blok"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export { AddBlockEntry };
