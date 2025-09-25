"use client";

import { CalendarPlus } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <motion.div
      className="container flex w-full flex-col items-center gap-8 px-4 text-center"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div
        className="rounded-full bg-gradient-to-r from-[#6583C8] to-[#80B3FF] p-0.5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <p className="flex h-full w-full rounded-full bg-[#a7b3cd] px-4 py-2 text-sm font-medium sm:text-base dark:bg-[#192237]">
          #wytrzyma
        </p>
      </motion.div>
      <motion.p
        className="text-5xl font-bold uppercase sm:text-8xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.3, ease: "easeOut" }}
      >
        Eventownik Solvro
      </motion.p>
      <motion.p
        className="text-xl text-[#191A1A] sm:text-3xl dark:text-[#D9E8FF]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.3, ease: "easeOut" }}
      >
        Zróbmy razem wydarzenie!
      </motion.p>
      <motion.div
        className="flex flex-row flex-wrap items-center justify-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.3, ease: "easeOut" }}
      >
        <Button
          className="w-full rounded-full bg-[#6583C8] px-5 py-4 text-base font-medium hover:bg-[#4b78df] sm:w-auto sm:text-lg"
          asChild
        >
          <Link href="/dashboard/events">
            <CalendarPlus />
            Organizuj wydarzenia
          </Link>
        </Button>
        <Button
          className="w-full rounded-full border-2 border-black bg-transparent px-5 py-4 text-base font-medium sm:w-auto sm:text-lg dark:border-white"
          variant={"outline"}
          asChild
        >
          <Link href="#events">Przeglądaj wydarzenia</Link>
        </Button>
      </motion.div>
    </motion.div>
  );
}
