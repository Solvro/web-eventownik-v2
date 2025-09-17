"use client";

import { ArrowUpRightFromCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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
      <Image
        src={
          typeof member.image === "string"
            ? member.image
            : "/assets/landing/person.webp"
        }
        alt={member.name}
        width={500}
        height={500}
        className="aspect-square h-auto w-full max-w-12 rounded-full sm:max-w-20"
      />
      <AnimatePresence>
        {isHovered ? (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0, scale: 1 }}
              transition={{ duration: 0.1 }}
              className="absolute inset-0 z-20"
            >
              <Image
                src={
                  typeof member.image === "string"
                    ? member.image
                    : "/assets/landing/person.webp"
                }
                alt={member.name}
                width={500}
                height={500}
                className="size-16 rounded-full sm:size-20"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="pointer-events-none absolute z-20 flex -translate-x-full flex-row items-center gap-2 rounded-full bg-black px-3 py-1 text-white shadow-lg"
              style={{
                top: position.y + 5,
                left: position.x - 5,
              }}
            >
              <p className="font-medium whitespace-nowrap">{member.name}</p>
              <ArrowUpRightFromCircle size={16} />
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
      <a
        href={member.url}
        target="_blank"
        className="absolute inset-0 z-30 block h-full w-full shrink-0"
        rel="noreferrer noopener"
      >
        <p className="sr-only">{member.name}</p>
      </a>
    </div>
  );
}
