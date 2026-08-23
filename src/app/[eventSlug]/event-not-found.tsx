import { useTranslations } from "next-intl";
import Link from "next/link";

import { Button } from "@/components/ui/button";

interface NotFoundProps {
  whatNotFound: "event" | "form" | "user" | "blocks";
}

export function EventNotFound({ whatNotFound }: NotFoundProps) {
  const t = useTranslations("Event");

  const messages = {
    event: t("notFound"),
    form: t("formNotFound"),
    user: t("failedToFetchUserData"),
    blocks: t("failedToFetchFormBlocks"),
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{messages[whatNotFound]}</h1>
        <p className="text-lg">{t("checkLinkOrContactOrganizer")}</p>
        <Link href="/">
          <Button variant="default" className="mt-6">
            {t("backToHome")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
