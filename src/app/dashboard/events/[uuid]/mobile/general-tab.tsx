"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, ExternalLink, Save, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { QRCode } from "react-qr-code";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import type { MobileAppConfig } from "@/types/mobile";

import { updateMobileConfig } from "./actions";
import { SubmitButton, useMobileAction } from "./shared";

const ConfigSchema = z.object({
  isEnabled: z.boolean(),
  welcomeMessage: z.string().max(2000),
  /** Empty string means "use the event's primary colour" */
  accentColor: z.union([z.literal(""), z.string().regex(/^#[0-9a-f]{6}$/i)]),
  sosEnabled: z.boolean(),
  scheduleEnabled: z.boolean(),
  chatEnabled: z.boolean(),
  tinderEnabled: z.boolean(),
  bingoEnabled: z.boolean(),
  berealEnabled: z.boolean(),
  bingoSize: z.enum(["3", "4", "5"]),
});

type ConfigValues = z.infer<typeof ConfigSchema>;

/** Shown in the colour picker while no custom colour is set */
const DEFAULT_ACCENT = "#f9d574";

const FEATURES = [
  "sosEnabled",
  "scheduleEnabled",
  "chatEnabled",
  "tinderEnabled",
  "bingoEnabled",
  "berealEnabled",
] as const;

function toFormValues(config: MobileAppConfig): ConfigValues {
  const size = config.bingoSize.toString();
  return {
    isEnabled: config.isEnabled,
    welcomeMessage: config.welcomeMessage ?? "",
    accentColor: config.accentColor ?? "",
    sosEnabled: config.sosEnabled,
    scheduleEnabled: config.scheduleEnabled,
    chatEnabled: config.chatEnabled,
    tinderEnabled: config.tinderEnabled,
    bingoEnabled: config.bingoEnabled,
    berealEnabled: config.berealEnabled,
    bingoSize: size === "3" || size === "4" ? size : "5",
  };
}

export function GeneralTab({
  eventUuid,
  config,
  participantUrl,
}: {
  eventUuid: string;
  config: MobileAppConfig;
  participantUrl: string;
}) {
  const t = useTranslations("MobileAdmin");
  const run = useMobileAction();
  const [copied, setCopied] = useState(false);

  const form = useForm<ConfigValues>({
    resolver: zodResolver(ConfigSchema),
    values: toFormValues(config),
  });

  const onSubmit = async (values: ConfigValues) => {
    await run(
      updateMobileConfig(eventUuid, {
        ...values,
        welcomeMessage:
          values.welcomeMessage.trim() === ""
            ? null
            : values.welcomeMessage.trim(),
        accentColor: values.accentColor === "" ? null : values.accentColor,
        bingoSize: Number(values.bingoSize),
      }),
      t("general.saved"),
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(participantUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      toast({ title: t("general.copyFailed"), variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-6"
        >
          <FormField
            control={form.control}
            name="isEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between gap-4 rounded-xl border p-4">
                <div className="space-y-1">
                  <FormLabel className="text-base">
                    {t("general.enabled")}
                  </FormLabel>
                  <FormDescription>
                    {t("general.enabledDescription")}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="welcomeMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("general.welcomeMessage")}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={3}
                    placeholder={t("general.welcomeMessagePlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="accentColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("general.accentColor")}</FormLabel>
                <div className="flex flex-wrap items-center gap-3">
                  <FormControl>
                    <input
                      type="color"
                      className="h-10 w-14 cursor-pointer rounded-md border bg-transparent p-1"
                      value={field.value === "" ? DEFAULT_ACCENT : field.value}
                      onChange={(event) => {
                        field.onChange(event.target.value);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <span className="text-muted-foreground font-mono text-sm">
                    {field.value === ""
                      ? t("general.accentColorDefault")
                      : field.value.toUpperCase()}
                  </span>
                  {field.value === "" ? null : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        field.onChange("");
                      }}
                    >
                      {t("general.accentColorReset")}
                    </Button>
                  )}
                </div>
                <FormDescription>
                  {t("general.accentColorDescription")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-sm font-medium">
              {t("general.features")}
            </legend>
            {FEATURES.map((feature) => (
              <FormField
                key={feature}
                control={form.control}
                name={feature}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border px-4 py-3">
                    <div className="space-y-0.5">
                      <FormLabel>{t(`general.feature.${feature}`)}</FormLabel>
                      <FormDescription>
                        {t(`general.featureDescription.${feature}`)}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </fieldset>
          <FormField
            control={form.control}
            name="bingoSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("general.bingoSize")}</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(["3", "4", "5"] as const).map((size) => (
                      <SelectItem key={size} value={size}>
                        {size} × {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {t("general.bingoSizeDescription")}
                </FormDescription>
              </FormItem>
            )}
          />
          <div>
            <SubmitButton
              isSubmitting={form.formState.isSubmitting}
              icon={<Save />}
            >
              {t("save")}
            </SubmitButton>
          </div>
        </form>
      </Form>
      <aside className="flex flex-col gap-4 lg:w-80">
        <div className="flex items-center gap-3 rounded-xl border p-4">
          <Users />
          <div>
            <p className="text-2xl font-bold">{config.profilesCount}</p>
            <p className="text-muted-foreground text-sm">
              {t("general.profilesCount")}
            </p>
          </div>
        </div>
        {config.isEnabled ? (
          <div className="flex flex-col gap-3 rounded-xl border p-4">
            <h3 className="font-semibold">{t("general.participantLink")}</h3>
            <p className="text-muted-foreground text-sm break-all">
              {participantUrl}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyLink}
              >
                {copied ? <Check /> : <Copy />}
                {copied ? t("general.copied") : t("general.copy")}
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={participantUrl} target="_blank" rel="noreferrer">
                  <ExternalLink /> {t("general.open")}
                </a>
              </Button>
            </div>
            <div className="rounded-lg bg-white p-4">
              <QRCode
                value={participantUrl}
                level="M"
                title={t("general.qrCode")}
                style={{ width: "100%", height: "auto" }}
              />
            </div>
            <p className="text-muted-foreground text-xs">
              {t("general.qrHint")}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
            {t("general.disabledHint")}
          </p>
        )}
      </aside>
    </div>
  );
}
