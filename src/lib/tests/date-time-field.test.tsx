import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { FormDateTimeField } from "@/components/date-time-field";
import { Form } from "@/components/ui/form";

import messages from "../../../messages/pl.json";

interface Values {
  openDate: Date;
  openTime: string;
  closeDate: Date;
  closeTime: string;
}

function Fields() {
  const form = useForm<Values>({
    defaultValues: {
      openDate: new Date(2026, 10, 2),
      openTime: "12:00",
      closeDate: new Date(2026, 10, 3),
      closeTime: "18:30",
    },
  });
  return (
    <Form {...form}>
      <FormDateTimeField
        control={form.control}
        formState={form.formState}
        label="Data i godzina otwarcia"
        timeLabel="Godzina otwarcia"
        dateName="openDate"
        timeName="openTime"
      />
      <FormDateTimeField
        control={form.control}
        formState={form.formState}
        label="Data rozpoczęcia"
        dateName="closeDate"
        timeName="closeTime"
      />
    </Form>
  );
}

describe("FormDateTimeField", () => {
  it("gives every time input its own accessible name", () => {
    render(
      <NextIntlClientProvider locale="pl" messages={messages}>
        <Fields />
      </NextIntlClientProvider>,
    );
    expect(screen.getByLabelText("Godzina otwarcia")).toHaveValue("12:00");
    // Without an explicit label the name is derived from the field label.
    expect(screen.getByLabelText("Data rozpoczęcia – godzina")).toHaveValue(
      "18:30",
    );
  });
});
