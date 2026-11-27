"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ListPlus, Pencil, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { MobileBingoTaskAdmin } from "@/types/mobile";

import {
  createBingoTask,
  createBingoTasksBulk,
  deleteBingoTask,
  updateBingoTask,
} from "./actions";
import {
  DeleteButton,
  EmptyState,
  SectionHeader,
  SubmitButton,
  useMobileAction,
} from "./shared";

const TaskSchema = z.object({ text: z.string().trim().min(1).max(200) });
type TaskValues = z.infer<typeof TaskSchema>;

const BulkSchema = z.object({ texts: z.string().trim().min(1) });
type BulkValues = z.infer<typeof BulkSchema>;

function TaskRow({
  eventUuid,
  task,
}: {
  eventUuid: string;
  task: MobileBingoTaskAdmin;
}) {
  const t = useTranslations("MobileAdmin");
  const run = useMobileAction();
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm<TaskValues>({
    resolver: zodResolver(TaskSchema),
    values: { text: task.text },
  });

  return (
    <li className="flex items-center gap-3 rounded-xl border px-4 py-2">
      {isEditing ? (
        <Form {...form}>
          <form
            className="flex flex-1 items-center gap-2"
            onSubmit={form.handleSubmit(async (values) => {
              const updated = await run(
                updateBingoTask(eventUuid, task.uuid, values.text.trim()),
                t("saved"),
              );
              if (updated !== null) {
                setIsEditing(false);
              }
            })}
          >
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="sr-only">{t("bingo.task")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              aria-label={t("save")}
              title={t("save")}
              disabled={form.formState.isSubmitting}
            >
              <Check />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t("cancel")}
              title={t("cancel")}
              onClick={() => {
                form.reset();
                setIsEditing(false);
              }}
            >
              <X />
            </Button>
          </form>
        </Form>
      ) : (
        <>
          <p className="min-w-0 flex-1">{task.text}</p>
          <span className="text-muted-foreground shrink-0 text-sm">
            {t("bingo.completions", { count: task.completionsCount })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("editItem", { name: task.text })}
            title={t("editItem", { name: task.text })}
            onClick={() => {
              setIsEditing(true);
            }}
          >
            <Pencil />
          </Button>
        </>
      )}
      <DeleteButton
        label={t("deleteItem", { name: task.text })}
        description={t("bingo.deleteDescription")}
        onConfirm={async () =>
          run(deleteBingoTask(eventUuid, task.uuid), t("deleted"))
        }
      />
    </li>
  );
}

export function BingoTab({
  eventUuid,
  tasks,
  size,
}: {
  eventUuid: string;
  tasks: MobileBingoTaskAdmin[];
  size: number;
}) {
  const t = useTranslations("MobileAdmin");
  const run = useMobileAction();
  const required = size * size;
  const sorted = tasks.toSorted((a, b) => a.order - b.order);

  const addForm = useForm<TaskValues>({
    resolver: zodResolver(TaskSchema),
    defaultValues: { text: "" },
  });
  const bulkForm = useForm<BulkValues>({
    resolver: zodResolver(BulkSchema),
    defaultValues: { texts: "" },
  });

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title={t("bingo.title")}
        description={t("bingo.description")}
      />
      <p
        className={`rounded-xl border p-4 text-sm ${tasks.length < required ? "border-amber-400 bg-amber-50 dark:bg-amber-950/30" : ""}`}
      >
        {t("bingo.requiredHint", {
          size,
          required,
          count: tasks.length,
        })}
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        <Form {...addForm}>
          <form
            className="flex flex-col gap-3 rounded-xl border p-4"
            onSubmit={addForm.handleSubmit(async (values) => {
              const created = await run(
                createBingoTask(eventUuid, values.text.trim()),
                t("saved"),
              );
              if (created !== null) {
                addForm.reset();
              }
            })}
          >
            <FormField
              control={addForm.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("bingo.addOne")}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t("bingo.placeholder")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <SubmitButton
                isSubmitting={addForm.formState.isSubmitting}
                icon={<Plus />}
              >
                {t("bingo.add")}
              </SubmitButton>
            </div>
          </form>
        </Form>
        <Form {...bulkForm}>
          <form
            className="flex flex-col gap-3 rounded-xl border p-4"
            onSubmit={bulkForm.handleSubmit(async (values) => {
              const texts = values.texts
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => line !== "");
              const result = await run(
                createBingoTasksBulk(eventUuid, texts),
                t("bingo.bulkAdded", { count: texts.length }),
              );
              if (result !== null) {
                bulkForm.reset();
              }
            })}
          >
            <FormField
              control={bulkForm.control}
              name="texts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("bingo.bulk")}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={5}
                      placeholder={t("bingo.bulkPlaceholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <SubmitButton
                isSubmitting={bulkForm.formState.isSubmitting}
                icon={<ListPlus />}
              >
                {t("bingo.bulkAdd")}
              </SubmitButton>
            </div>
          </form>
        </Form>
      </div>
      {sorted.length === 0 ? (
        <EmptyState>{t("bingo.empty")}</EmptyState>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((task) => (
            <TaskRow key={task.uuid} eventUuid={eventUuid} task={task} />
          ))}
        </ul>
      )}
    </div>
  );
}
