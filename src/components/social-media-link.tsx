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

export function SocialMediaLink({
  link,
  className,
}: {
  link: string;
  className?: string;
}) {
  return (
    <Tooltip key={link} delayDuration={0}>
      <TooltipTrigger asChild>
        <Link href={link} target="_blank">
          <EventInfoDiv className={className}>
            {link.includes("facebook.com") ? (
              <FaFacebookF size={20} />
            ) : link.includes("instagram.com") ? (
              <FaInstagram size={20} />
            ) : link.includes("tiktok.com") ? (
              <FaTiktok size={20} />
            ) : link.includes("discord.com") ? (
              <FaDiscord size={20} />
            ) : link.includes("youtube.com") ? (
              <FaYoutube size={20} />
            ) : link.includes("google.com/maps") ? (
              <FaLocationDot size={20} />
            ) : link.includes("docs.google.com") ? (
              <FaGoogleDrive size={20} />
            ) : (
              <FaGlobe size={20} />
            )}
            {new URL(link).hostname.replace("www.", "")}
          </EventInfoDiv>
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        {link.slice(0, 60)}
        {link.length > 50 ? "..." : ""}
      </TooltipContent>
    </Tooltip>
  );
}
