"use client";

import { motion } from "motion/react";
import Image from "next/image";

import cube from "@/assets/cube.png";
import visionImage from "@/assets/landing_vision.png";
import sphere from "@/assets/sphere.png";

import { MacbookScroll } from "../ui/macbook-scroll";

export function Hero() {
  return (
    <section>
      <div className="flex flex-col md:mt-12 md:flex-row md:justify-between">
        <div className="xl:mb-0">
          <div>
            <h1 className="order-2 mb-8 h-3/4 text-3xl md:text-5xl xl:order-1 2xl:text-7xl">
              <b>Eventownik</b> - zróbmy <br /> razem wydarzenie!
            </h1>
          </div>
        </div>
        <div>
          <MacbookScroll src={visionImage.src} />
        </div>
        <div className="relative">
          <div className="top-0 right-0 bottom-0 left-0 flex items-center justify-center xl:absolute">
            <motion.div
              animate={{ y: [-10, 20, -10] }}
              transition={{ ease: "easeOut", duration: 3, repeat: Infinity }}
              className="top-0 -left-48 xl:absolute"
            >
              <Image alt="Sphere" src={sphere} className="hidden 2xl:block" />
            </motion.div>
            <motion.div
              animate={{ y: [30, -30, 30] }}
              transition={{ ease: "easeOut", duration: 5, repeat: Infinity }}
              className="top-72 xl:absolute"
              style={{ left: "-80rem" }}
            >
              <Image alt="Cube" src={cube} className="hidden 2xl:block" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
