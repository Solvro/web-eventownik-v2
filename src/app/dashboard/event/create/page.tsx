"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const createEventFormSchema = z.object({
  name: z.string().nonempty("Nazwa nie może być pusta."),
  description: z.string().nonempty("Opis nie może być pusty."),
  startDate: z.date().min(new Date(), {
    message: "Data musi być w przyszłości.",
  }),
  startTime: z.string().nonempty("Godzina rozpoczęcia nie może być pusta."),
  endDate: z.date().refine((date) => date > new Date(), {
    message: "Data zakończenia musi być po dacie rozpoczęcia.",
  }),
  endTime: z.string().nonempty("Godzina zakończenia nie może być pusta."),
  lat: z.number().min(-90).max(90),
  long: z.number().min(-180).max(180),
  organizer: z.string().optional(),
});

export default function CreateEvent() {
  const form = useForm<z.infer<typeof createEventFormSchema>>({
    resolver: zodResolver(createEventFormSchema),
    defaultValues: {
      name: "",
      description: "",
      startTime: "",
      endTime: "",
      lat: 0,
      long: 0,
    },
  });

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-4">
        <div className="flex rounded-full border border-neutral-300 p-3">
          <CalendarIcon />
        </div>
        <div className="space-y-1 text-center">
          <p className="text-neutral-500">Krok 1</p>
          <p className="text-lg font-medium">Podaj ogólne dane wydarzenia.</p>
        </div>
      </div>
      <Form {...form}>
        <form className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="w-full space-y-4">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nazwa</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        disabled={form.formState.isSubmitting}
                        placeholder="Podaj nazwę wydarzenia"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <FormLabel>Data i godzina</FormLabel>
                <div className="flex flex-row items-center gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[240px] pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Data rozpoczęcia</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              className="z-50"
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date <= new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <Input type="time" {...field} />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex flex-row items-center gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[240px] pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Data zakończenia</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              className="z-50"
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date <= new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <Input type="time" {...field} />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            <div>
              <FormField
                name="description"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex h-full flex-col gap-2">
                    <FormLabel>Opis</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={form.formState.isSubmitting}
                        placeholder="Opisz wydarzenie"
                        className="h-full resize-none"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <FormLabel>Miejsce</FormLabel>
              <Input type="text" placeholder="Wybierz miejsce wydarzenia" />
            </div>
            <div className="space-y-2">
              <FormLabel>Organizator (opcjonalnie)</FormLabel>
              <Input type="text" placeholder="Podaj organizatora wydarzenia" />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
