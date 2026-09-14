"use client";

import { useTranslations } from "next-intl";

import { Empty, EmptyDescription } from "@/components/ui/empty";
import type { AttributeType } from "@/types/attributes";

/**
 * How an answer to this attribute type can be acted on, so that an organizer
 * can contact someone straight from the list. Types absent from this table have
 * no useful action and render as plain text.
 */
const ANSWER_ACTION: Partial<
  Record<AttributeType, (answer: string) => string>
> = {
  email: (answer) => `mailto:${answer}`,
  // `tel:` targets carry no spaces, though participants happily type them.
  tel: (answer) => `tel:${answer.replaceAll(/\s/gu, "")}`,
};

/**
 * Every participant's answer to a free-text attribute, one after another.
 *
 * Answers are shown in full and wrapped, with the participant's own line breaks
 * preserved, and the list has no height of its own — the organizer scrolls the
 * page rather than a box inside it. Nothing says who wrote which answer: this is
 * a list of answers, not a second participants table.
 */
export function StatisticsAnswerList({
  answers,
  type,
}: {
  answers: string[];
  type: AttributeType;
}) {
  const t = useTranslations("Statistics");

  if (answers.length === 0) {
    return (
      <Empty className="border">
        <EmptyDescription>{t("noData")}</EmptyDescription>
      </Empty>
    );
  }

  const action = ANSWER_ACTION[type];

  return (
    <ul className="flex flex-col gap-3">
      {answers.map((answer, index) => (
        <li
          // Answers repeat and carry no identity of their own, but the list is
          // read-only and never reorders, so the position is a stable key.
          key={index}
          className="bg-muted/40 rounded-md border px-4 py-3 wrap-break-word whitespace-pre-wrap"
        >
          {action == null ? (
            answer
          ) : (
            <a
              href={action(answer)}
              className="text-primary underline-offset-4 hover:underline"
            >
              {answer}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
