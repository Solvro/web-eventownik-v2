"use client";

import { ArrowUpRightFromCircle } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";

import { cn } from "@/lib/utils";

import type { TeamMember } from "./team-member";

export function HighlightedMember({
  member,
  className,
  translateX,
  translateY,
  rotate,
  zIndex,
  color,
}: {
  member: TeamMember;
  className?: string;
  translateX: string;
  translateY: number;
  rotate: number;
  zIndex: number;
  color: string;
}) {
  return (
    <motion.div
      className="group absolute flex items-center justify-center"
      variants={{
        hidden: { x: 0, y: 0 },
        visible: { x: translateX, y: translateY },
      }}
      style={{ zIndex }}
    >
      <div className="absolute flex flex-col items-center transition-all group-hover:flex group-hover:-translate-y-40 group-hover:drop-shadow-2xl">
        <div
          className="pointer-events-none flex flex-row items-center gap-4 rounded-full px-5 py-2.5 text-sm text-black"
          style={{ backgroundColor: color }}
        >
          <div>
            <p className="font-medium whitespace-nowrap">{member.name}</p>
            <p className="font-bold whitespace-nowrap">
              {member.roles.join(", ")}
            </p>
          </div>
          <ArrowUpRightFromCircle />
        </div>
        <span
          className="h-24 border-l-2 border-dashed"
          style={{ borderColor: color }}
        ></span>
      </div>
      <motion.a
        title={member.name}
        href={member.url}
        target="_blank"
        rel="noreferrer noopener"
        className={cn(
          className,
          "inline-block aspect-square shrink-0 rounded-4xl transition group-hover:outline-2",
        )}
        style={{ outlineColor: color }}
        variants={{
          hidden: { rotate: rotate - 6 },
          visible: { rotate },
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
          className="size-72 rounded-4xl"
        />
      </motion.a>
    </motion.div>
  );
}

export function HighlightedMembers({ team }: { team: TeamMember[] }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 1 }}
      className="flex h-84 w-full flex-row items-end justify-center"
    >
      <HighlightedMember
        member={team[3]}
        translateY={16}
        rotate={6}
        translateX="-32rem"
        zIndex={0}
        color="#36B9F5"
      />
      <HighlightedMember
        member={team[1]}
        translateY={4}
        rotate={-6}
        translateX="-16rem"
        zIndex={10}
        color="#B735F2"
      />
      <HighlightedMember
        member={team[0]}
        translateY={0}
        translateX="0"
        rotate={12}
        zIndex={20}
        color="#fd36fa"
      />
      <HighlightedMember
        member={team[2]}
        translateY={4}
        rotate={6}
        translateX="16rem"
        zIndex={10}
        color="#C3F235"
      />
      <HighlightedMember
        member={team[4]}
        translateY={16}
        rotate={-6}
        translateX="32rem"
        zIndex={0}
        color="#f1eb34"
      />
    </motion.div>
  );
}
