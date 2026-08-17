import Link from "next/link";
import React from "react";
import {
  FaDiscord,
  FaFacebookF,
  FaGlobe,
  FaGoogleDrive,
  FaInstagram,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

import { EventInfoDiv } from "@/components/event-info-div";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EventLink } from "@/types/link";

export function SocialMediaLink({
  link,
  className,
}: {
  link: EventLink;
  className?: string;
}) {
  const { url, label } = link;
  const displaylabel =
    label.trim().length > 0 ? label : new URL(url).hostname.replace("www.", "");

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Link href={url} target="_blank">
          <EventInfoDiv className={className}>
            {url.includes("facebook.com") || url.includes("fb.me") ? (
              <FaFacebookF size={20} />
            ) : url.includes("instagram.com") ? (
              <FaInstagram size={20} />
            ) : url.includes("tiktok.com") ? (
              <FaTiktok size={20} />
            ) : url.includes("discord.com") ? (
              <FaDiscord size={20} />
            ) : url.includes("youtube.com") ? (
              <FaYoutube size={20} />
            ) : url.includes("google.com/maps") ? (
              <FaLocationDot size={20} />
            ) : url.includes("docs.google.com") ||
              url.includes("drive.google.com") ? (
              <FaGoogleDrive size={20} />
            ) : (
              <FaGlobe size={20} />
            )}
            {displaylabel}
          </EventInfoDiv>
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        {url.slice(0, 60)}
        {url.length > 60 ? "..." : ""}
      </TooltipContent>
    </Tooltip>
  );
}
