"use client";

import { ArrowUpRightFromCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import type { TeamMember } from "./team-member";

export function Member({ member }: { member: TeamMember }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  };
  return (
    <div
      className="relative"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      <a
        title={member.name}
        href={member.url}
        key={member.name}
        target="_blank"
        className="inline-block shrink-0"
        rel="noreferrer noopener"
      >
        <Image
          src={
            typeof member.image === "string"
              ? member.image
              : "/assets/person.webp"
          }
          alt={member.name}
          width={500}
          height={500}
          className="size-20 rounded-full"
        />
      </a>
      {isHovered ? (
        <div
          className="pointer-events-none absolute flex -translate-x-full flex-row items-center gap-2 rounded-full bg-black px-3 py-1 text-white shadow-lg"
          style={{
            top: position.y + 5,
            left: position.x - 5,
          }}
        >
          <p className="font-medium whitespace-nowrap">{member.name}</p>
          <ArrowUpRightFromCircle size={16} />
        </div>
      ) : null}
    </div>
  );
}
