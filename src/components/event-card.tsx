import {
  Calendar1,
  CircleHelpIcon,
  Globe,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

import EventPhotoPlaceholder from "@/../public/event-photo-placeholder.png";
import { ClientFormattedDate } from "@/components/client-formatted-date";
import { EventInfoBlock } from "@/components/event-info-block";
import { ShareButton } from "@/components/share-button";
import { Button } from "@/components/ui/button";
import { PHOTO_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Event } from "@/types/event";

import { ActivateEvent } from "../app/dashboard/admin/activate-event";

export function EventCardBase({
  event,
  children,
  className,
}: {
  event: Event;
  children?: React.ReactNode;
  className?: string;
}) {
  const t = useTranslations("Dashboard");

  return (
    <div
      className={cn(
        "bg-background flex h-full flex-col overflow-hidden rounded-xl",
        className,
      )}
    >
      <Link className="relative" href={`/dashboard/events/${event.uuid}`}>
        <Image
          src={
            event.photoUrl == null
              ? EventPhotoPlaceholder
              : `${PHOTO_URL}/${event.photoUrl}`
          }
          width="500"
          height="500"
          className="aspect-square w-full object-cover"
          alt={`${t("eventImage")} ${event.name}`}
        />
        <div className="absolute inset-0 z-10 flex h-full flex-col justify-between p-4">
          <div className="flex flex-row justify-between">
            <EventInfoBlock>
              <Calendar1 size={16} />
              <p className="text-sm">
                <ClientFormattedDate date={event.startDate} />
              </p>
            </EventInfoBlock>
            <EventInfoBlock>
              <p className="text-sm">{event.participantsCount}</p>
              <Users size={16} />
            </EventInfoBlock>
          </div>
        </div>
      </Link>
      <div className="flex flex-1 flex-col justify-between p-4">
        <h3 className="mb-4 line-clamp-2 text-2xl font-bold">
          <Link href={`/dashboard/events/${event.uuid}`}>{event.name}</Link>
        </h3>
        {children}
      </div>
    </div>
  );
}

export function EventCard({ event }: { event: Event }) {
  const t = useTranslations("Dashboard");

  return (
    <EventCardBase event={event} className="border-muted border">
      <div className="flex w-full items-center justify-between">
        <Button asChild variant="ghost" className="flex-1 justify-start">
          <Link href={`/dashboard/events/${event.uuid}`}>
            <CircleHelpIcon className="size-4" />
            {t("viewDetails")}
          </Link>
        </Button>
        <ShareButton
          path={event.slug}
          variant="icon"
          className="size-12"
          buttonVariant="ghost"
          label={t("share")}
          tooltipText={t("copiedToClipboard")}
        />
      </div>
    </EventCardBase>
  );
}

export function EventCardForSuperadmin({
  event,
  bearerToken,
}: {
  event: Event;
  bearerToken: string;
}) {
  const t = useTranslations("Dashboard");

  return (
    <EventCardBase
      event={event}
      className={cn(
        "border-2",
        event.isActive ? "border-green-400" : "border-red-400",
      )}
    >
      <div className="flex w-full flex-col gap-2">
        <Button asChild variant="outline">
          <Link href={`/dashboard/events/${event.uuid}`}>
            <LayoutDashboard className="size-4" />
            Dashboard
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/${event.slug}`} target="_blank">
            <Globe className="size-4" />
            {t("page")}
          </Link>
        </Button>
        <ActivateEvent
          bearerToken={bearerToken}
          eventUuid={event.uuid}
          isActive={event.isActive}
        />
      </div>
    </EventCardBase>
  );
}
