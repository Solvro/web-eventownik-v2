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
import { Button, buttonVariants } from "@/components/ui/button";
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
  return (
    <div
      className={cn(
        "bg-background group relative flex h-full flex-col overflow-hidden rounded-xl",
        className,
      )}
    >
      <div className="relative">
        <Image
          src={
            event.photoUrl == null
              ? EventPhotoPlaceholder
              : `${PHOTO_URL}/${event.photoUrl}`
          }
          width="500"
          height="500"
          className="aspect-square w-full object-cover"
          alt=""
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
      </div>
      <div className="flex flex-1 flex-col justify-between p-4">
        <h3 className="mb-4 line-clamp-2 text-2xl font-bold">
          {/* Stretched link: its ::after covers the whole card, so the card acts as a single link */}
          <Link
            href={`/dashboard/events/${event.id.toString()}`}
            className="focus-visible:after:ring-ring after:absolute after:inset-0 after:z-20 after:rounded-xl focus-visible:outline-hidden focus-visible:after:ring-2 focus-visible:after:ring-inset"
          >
            {event.name}
          </Link>
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
        <span
          aria-hidden="true"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "group-hover:bg-primary/10 flex-1 justify-start",
          )}
        >
          <CircleHelpIcon className="size-4" />
          {t("viewDetails")}
        </span>
        <ShareButton
          path={event.slug}
          variant="icon"
          className="relative z-30 size-12"
          buttonVariant="ghost"
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
        <span
          aria-hidden="true"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "group-hover:bg-accent group-hover:text-accent-foreground",
          )}
        >
          <LayoutDashboard className="size-4" />
          Dashboard
        </span>
        <Button asChild variant="outline" className="relative z-30">
          <Link href={`/${event.slug}`} target="_blank">
            <Globe className="size-4" />
            {t("page")}
          </Link>
        </Button>
        <div className="relative z-30 flex flex-col">
          <ActivateEvent
            bearerToken={bearerToken}
            eventId={event.id}
            isActive={event.isActive}
          />
        </div>
      </div>
    </EventCardBase>
  );
}
