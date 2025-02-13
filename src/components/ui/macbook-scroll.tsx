"use client";

import {
  IconBrightnessDown,
  IconBrightnessUp,
  IconCaretDownFilled,
  IconCaretLeftFilled,
  IconCaretRightFilled,
  IconCaretUpFilled,
  IconChevronUp,
  IconCommand,
  IconMicrophone,
  IconMoon,
  IconPlayerSkipForward,
  IconPlayerTrackNext,
  IconPlayerTrackPrev,
  IconSearch,
  IconTable,
  IconVolume,
  IconVolume2,
  IconVolume3,
  IconWorld,
} from "@tabler/icons-react";
import type { MotionValue } from "framer-motion";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export function MacbookScroll({
  src,
  showGradient,
  badge,
}: {
  src?: string;
  showGradient?: boolean;
  badge?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 900) {
      setIsMobile(true);
    }
  }, []);

  const scaleX = useTransform(
    scrollYProgress,
    [0, 0.3],
    [1.2, isMobile ? 1.4 : 1.2],
  );
  const scaleY = useTransform(
    scrollYProgress,
    [0, 0.3],
    [0.6, isMobile ? 1.4 : 1.2],
  );
  const translate = useTransform(
    scrollYProgress,
    [0, isMobile ? 0.8 : 0.9],
    [0, isMobile ? 2050 : 950],
  );
  const rotate = useTransform(scrollYProgress, [0.1, 0.12, 0.3], [-28, -28, 0]);

  return (
    <div
      ref={ref}
      className="flex flex-shrink-0 scale-[0.50] transform flex-col items-center justify-start py-0 [perspective:800px] md:pb-80 min-[900px]:scale-100"
    >
      <Lid
        src={src}
        scaleX={scaleX}
        scaleY={scaleY}
        rotate={rotate}
        translate={translate}
      />
      {/* Base area */}
      <div className="relative -z-10 h-[22rem] w-[32rem] overflow-hidden rounded-2xl bg-gray-200 dark:bg-[#272729]">
        {/* above keyboard bar */}
        <div className="relative h-10 w-full">
          <div className="absolute inset-x-0 mx-auto h-4 w-[80%] bg-[#050505]" />
        </div>
        <div className="relative flex">
          <div className="mx-auto h-full w-[10%] overflow-hidden">
            <SpeakerGrid />
          </div>
          <div className="mx-auto h-full w-[80%]">
            <Keypad />
          </div>
          <div className="mx-auto h-full w-[10%] overflow-hidden">
            <SpeakerGrid />
          </div>
        </div>
        <Trackpad />
        <div className="absolute inset-x-0 bottom-0 mx-auto h-2 w-20 rounded-tl-3xl rounded-tr-3xl bg-gradient-to-t from-[#272729] to-[#050505]" />
        {showGradient === true ? (
          <div className="absolute inset-x-0 bottom-0 z-50 h-40 w-full bg-gradient-to-t from-white via-white to-transparent dark:from-black dark:via-black" />
        ) : null}
        {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */}
        {badge ? <div className="absolute bottom-4 left-4">{badge}</div> : null}
      </div>
    </div>
  );
}

export function Lid({
  scaleX,
  scaleY,
  rotate,
  translate,
  src,
}: {
  scaleX: MotionValue<number>;
  scaleY: MotionValue<number>;
  rotate: MotionValue<number>;
  translate: MotionValue<number>;
  src?: string;
}) {
  return (
    <div className="relative [perspective:800px]">
      <div
        style={{
          transform: "perspective(800px) rotateX(-25deg) translateZ(0px)",
          transformOrigin: "bottom",
          transformStyle: "preserve-3d",
        }}
        className="relative h-[12rem] w-[32rem] rounded-2xl bg-[#010101] p-2"
      >
        <div
          style={{
            boxShadow: "0px 2px 0px 2px var(--neutral-900) inset",
          }}
          className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#010101]"
        >
          <span className="text-white">
            <AceternityLogo />
          </span>
        </div>
      </div>
      <motion.div
        style={{
          scaleX,
          scaleY,
          rotateX: rotate,
          translateY: translate,
          transformStyle: "preserve-3d",
          transformOrigin: "top",
        }}
        className="absolute inset-0 h-96 w-[32rem] rounded-2xl bg-[#010101] p-2"
      >
        <div className="absolute inset-0 rounded-lg bg-[#272729]" />
        <Image
          // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
          src={src as string}
          alt="aceternity logo"
          fill={true}
          className="absolute inset-0 h-full w-full rounded-lg object-cover object-left-top"
        />
      </motion.div>
    </div>
  );
}

export function Trackpad() {
  return (
    <div
      className="mx-auto my-1 h-32 w-[40%] rounded-xl"
      style={{
        boxShadow: "0px 0px 1px 1px #00000020 inset",
      }}
    />
  );
}

export function Keypad() {
  return (
    <div className="mx-1 h-full rounded-md bg-[#050505] p-1">
      {/* First Row */}
      <Row>
        <KButton
          className="w-10 items-end justify-start pb-[2px] pl-[4px]"
          childrenClassName="items-start"
        >
          esc
        </KButton>
        <KButton>
          <IconBrightnessDown className="h-[6px] w-[6px]" />
          <span className="mt-1 inline-block">F1</span>
        </KButton>

        <KButton>
          <IconBrightnessUp className="h-[6px] w-[6px]" />
          <span className="mt-1 inline-block">F2</span>
        </KButton>
        <KButton>
          <IconTable className="h-[6px] w-[6px]" />
          <span className="mt-1 inline-block">F3</span>
        </KButton>
        <KButton>
          <IconSearch className="h-[6px] w-[6px]" />
          <span className="mt-1 inline-block">F4</span>
        </KButton>
        <KButton>
          <IconMicrophone className="h-[6px] w-[6px]" />
          <span className="mt-1 inline-block">F5</span>
        </KButton>
        <KButton>
          <IconMoon className="h-[6px] w-[6px]" />
          <span className="mt-1 inline-block">F6</span>
        </KButton>
        <KButton>
          <IconPlayerTrackPrev className="h-[6px] w-[6px]" />
          <span className="mt-1 inline-block">F7</span>
        </KButton>
        <KButton>
          <IconPlayerSkipForward className="h-[6px] w-[6px]" />
          <span className="mt-1 inline-block">F8</span>
        </KButton>
        <KButton>
          <IconPlayerTrackNext className="h-[6px] w-[6px]" />
          <span className="mt-1 inline-block">F8</span>
        </KButton>
        <KButton>
          <IconVolume3 className="h-[6px] w-[6px]" />
          <span className="mt-1 inline-block">F10</span>
        </KButton>
        <KButton>
          <IconVolume2 className="h-[6px] w-[6px]" />
          <span className="mt-1 inline-block">F11</span>
        </KButton>
        <KButton>
          <IconVolume className="h-[6px] w-[6px]" />
          <span className="mt-1 inline-block">F12</span>
        </KButton>
        <KButton>
          <div className="h-4 w-4 rounded-full bg-gradient-to-b from-neutral-900 from-20% via-black via-50% to-neutral-900 to-95% p-px">
            <div className="h-full w-full rounded-full bg-black" />
          </div>
        </KButton>
      </Row>

      {/* Second row */}
      <Row>
        <KButton>
          <span className="block">~</span>
          <span className="mt-1 block">`</span>
        </KButton>

        <KButton>
          <span className="block">!</span>
          <span className="block">1</span>
        </KButton>
        <KButton>
          <span className="block">@</span>
          <span className="block">2</span>
        </KButton>
        <KButton>
          <span className="block">#</span>
          <span className="block">3</span>
        </KButton>
        <KButton>
          <span className="block">$</span>
          <span className="block">4</span>
        </KButton>
        <KButton>
          <span className="block">%</span>
          <span className="block">5</span>
        </KButton>
        <KButton>
          <span className="block">^</span>
          <span className="block">6</span>
        </KButton>
        <KButton>
          <span className="block">&</span>
          <span className="block">7</span>
        </KButton>
        <KButton>
          <span className="block">*</span>
          <span className="block">8</span>
        </KButton>
        <KButton>
          <span className="block">(</span>
          <span className="block">9</span>
        </KButton>
        <KButton>
          <span className="block">)</span>
          <span className="block">0</span>
        </KButton>
        <KButton>
          <span className="block">&mdash;</span>
          <span className="block">_</span>
        </KButton>
        <KButton>
          <span className="block">+</span>
          <span className="block"> = </span>
        </KButton>
        <KButton
          className="w-10 items-end justify-end pb-[2px] pr-[4px]"
          childrenClassName="items-end"
        >
          delete
        </KButton>
      </Row>

      {/* Third row */}
      <Row>
        <KButton
          className="w-10 items-end justify-start pb-[2px] pl-[4px]"
          childrenClassName="items-start"
        >
          tab
        </KButton>
        <KButton>
          <span className="block">Q</span>
        </KButton>

        <KButton>
          <span className="block">W</span>
        </KButton>
        <KButton>
          <span className="block">E</span>
        </KButton>
        <KButton>
          <span className="block">R</span>
        </KButton>
        <KButton>
          <span className="block">T</span>
        </KButton>
        <KButton>
          <span className="block">Y</span>
        </KButton>
        <KButton>
          <span className="block">U</span>
        </KButton>
        <KButton>
          <span className="block">I</span>
        </KButton>
        <KButton>
          <span className="block">O</span>
        </KButton>
        <KButton>
          <span className="block">P</span>
        </KButton>
        <KButton>
          <span className="block">{`{`}</span>
          <span className="block">[</span>
        </KButton>
        <KButton>
          <span className="block">{`}`}</span>
          <span className="block">]</span>
        </KButton>
        <KButton>
          <span className="block">|</span>
          <span className="block">{`\\`}</span>
        </KButton>
      </Row>

      {/* Fourth Row */}
      <Row>
        <KButton
          className="w-[2.8rem] items-end justify-start pb-[2px] pl-[4px]"
          childrenClassName="items-start"
        >
          caps lock
        </KButton>
        <KButton>
          <span className="block">A</span>
        </KButton>

        <KButton>
          <span className="block">S</span>
        </KButton>
        <KButton>
          <span className="block">D</span>
        </KButton>
        <KButton>
          <span className="block">F</span>
        </KButton>
        <KButton>
          <span className="block">G</span>
        </KButton>
        <KButton>
          <span className="block">H</span>
        </KButton>
        <KButton>
          <span className="block">J</span>
        </KButton>
        <KButton>
          <span className="block">K</span>
        </KButton>
        <KButton>
          <span className="block">L</span>
        </KButton>
        <KButton>
          <span className="block">:</span>
          <span className="block">;</span>
        </KButton>
        <KButton>
          <span className="block">{`"`}</span>
          <span className="block">{`'`}</span>
        </KButton>
        <KButton
          className="w-[2.85rem] items-end justify-end pb-[2px] pr-[4px]"
          childrenClassName="items-end"
        >
          return
        </KButton>
      </Row>

      {/* Fifth Row */}
      <Row>
        <KButton
          className="w-[3.65rem] items-end justify-start pb-[2px] pl-[4px]"
          childrenClassName="items-start"
        >
          shift
        </KButton>
        <KButton>
          <span className="block">Z</span>
        </KButton>
        <KButton>
          <span className="block">X</span>
        </KButton>
        <KButton>
          <span className="block">C</span>
        </KButton>
        <KButton>
          <span className="block">V</span>
        </KButton>
        <KButton>
          <span className="block">B</span>
        </KButton>
        <KButton>
          <span className="block">N</span>
        </KButton>
        <KButton>
          <span className="block">M</span>
        </KButton>
        <KButton>
          <span className="block">{`<`}</span>
          <span className="block">,</span>
        </KButton>
        <KButton>
          <span className="block">{`>`}</span>
          <span className="block">.</span>
        </KButton>{" "}
        <KButton>
          <span className="block">?</span>
          <span className="block">/</span>
        </KButton>
        <KButton
          className="w-[3.65rem] items-end justify-end pb-[2px] pr-[4px]"
          childrenClassName="items-end"
        >
          shift
        </KButton>
      </Row>

      {/* sixth Row */}
      <Row>
        <KButton
          className=""
          childrenClassName="h-full justify-between py-[4px]"
        >
          <div className="flex w-full justify-end pr-1">
            <span className="block">fn</span>
          </div>
          <div className="flex w-full justify-start pl-1">
            <IconWorld className="h-[6px] w-[6px]" />
          </div>
        </KButton>
        <KButton
          className=""
          childrenClassName="h-full justify-between py-[4px]"
        >
          <div className="flex w-full justify-end pr-1">
            <IconChevronUp className="h-[6px] w-[6px]" />
          </div>
          <div className="flex w-full justify-start pl-1">
            <span className="block">control</span>
          </div>
        </KButton>
        <KButton
          className=""
          childrenClassName="h-full justify-between py-[4px]"
        >
          <div className="flex w-full justify-end pr-1">
            <OptionKey className="h-[6px] w-[6px]" />
          </div>
          <div className="flex w-full justify-start pl-1">
            <span className="block">option</span>
          </div>
        </KButton>
        <KButton
          className="w-8"
          childrenClassName="h-full justify-between py-[4px]"
        >
          <div className="flex w-full justify-end pr-1">
            <IconCommand className="h-[6px] w-[6px]" />
          </div>
          <div className="flex w-full justify-start pl-1">
            <span className="block">command</span>
          </div>
        </KButton>
        <KButton className="w-[8.2rem]" />
        <KButton
          className="w-8"
          childrenClassName="h-full justify-between py-[4px]"
        >
          <div className="flex w-full justify-start pl-1">
            <IconCommand className="h-[6px] w-[6px]" />
          </div>
          <div className="flex w-full justify-start pl-1">
            <span className="block">command</span>
          </div>
        </KButton>
        <KButton
          className=""
          childrenClassName="h-full justify-between py-[4px]"
        >
          <div className="flex w-full justify-start pl-1">
            <OptionKey className="h-[6px] w-[6px]" />
          </div>
          <div className="flex w-full justify-start pl-1">
            <span className="block">option</span>
          </div>
        </KButton>
        <div className="mt-[2px] flex h-6 w-[4.9rem] flex-col items-center justify-end rounded-[4px] p-[0.5px]">
          <KButton className="h-3 w-6">
            <IconCaretUpFilled className="h-[6px] w-[6px]" />
          </KButton>
          <div className="flex">
            <KButton className="h-3 w-6">
              <IconCaretLeftFilled className="h-[6px] w-[6px]" />
            </KButton>
            <KButton className="h-3 w-6">
              <IconCaretDownFilled className="h-[6px] w-[6px]" />
            </KButton>
            <KButton className="h-3 w-6">
              <IconCaretRightFilled className="h-[6px] w-[6px]" />
            </KButton>
          </div>
        </div>
      </Row>
    </div>
  );
}
export function KButton({
  className,
  children,
  childrenClassName,
  backlit = true,
}: {
  className?: string;
  children?: React.ReactNode;
  childrenClassName?: string;
  backlit?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[4px] p-[0.5px]",
        backlit && "bg-white/[0.2] shadow-xl shadow-white",
      )}
    >
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-[3.5px] bg-[#0A090D]",
          className,
        )}
        style={{
          boxShadow:
            "0px -0.5px 2px 0 #0D0D0F inset, -0.5px 0px 2px 0 #0D0D0F inset",
        }}
      >
        <div
          className={cn(
            "flex w-full flex-col items-center justify-center text-[5px] text-neutral-200",
            childrenClassName,
            backlit && "text-white",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-[2px] flex w-full flex-shrink-0 gap-[2px]">
      {children}
    </div>
  );
}

export function SpeakerGrid() {
  return (
    <div
      className="mt-2 flex h-40 gap-[2px] px-[0.5px]"
      style={{
        backgroundImage:
          "radial-gradient(circle, #08080A 0.5px, transparent 0.5px)",
        backgroundSize: "3px 3px",
      }}
    />
  );
}

export function OptionKey({ className }: { className: string }) {
  return (
    <svg
      fill="none"
      version="1.1"
      id="icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={className}
    >
      <rect
        stroke="currentColor"
        strokeWidth={2}
        x="18"
        y="5"
        width="10"
        height="2"
      />
      <polygon
        stroke="currentColor"
        strokeWidth={2}
        points="10.6,5 4,5 4,7 9.4,7 18.4,27 28,27 28,25 19.6,25 "
      />
      <rect
        id="_Transparent_Rectangle_"
        className="st0"
        width="32"
        height="32"
        stroke="none"
      />
    </svg>
  );
}

function AceternityLogo() {
  return (
    <svg
      width="66"
      height="65"
      viewBox="0 0 66 65"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-3 w-3 text-white"
    >
      <path
        d="M8 8.05571C8 8.05571 54.9009 18.1782 57.8687 30.062C60.8365 41.9458 9.05432 57.4696 9.05432 57.4696"
        stroke="currentColor"
        strokeWidth="15"
        strokeMiterlimit="3.86874"
        strokeLinecap="round"
      />
    </svg>
  );
}
