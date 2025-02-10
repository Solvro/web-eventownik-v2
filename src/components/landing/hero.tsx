"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import cube from "@/assets/cube.png";
import visionImage from "@/assets/landing_vision.png";
import sphere from "@/assets/sphere.png";
import { Button } from "@/components/ui/button";
import { MacbookScroll } from "@/components/ui/macbook-scroll";

//import { useCreateEvent } from "@/lib/useCreateEvent";

export function Hero() {
  //TODO creating event and navigating to createEvent view
  //const event = useCreateEvent();
  //const router = useRouter();
  return (
    <section>
      <div className="mt-8 flex flex-col p-12 pb-0 md:flex-row md:justify-between xl:mt-24">
        <div className="xl:mb-0">
          <div>
            <h1 className="text order-2 mb-8 h-3/4 text-3xl text-primary-foreground md:text-5xl xl:order-1 2xl:text-7xl">
              Eventownik - zróbmy razem
              <br />
              wydarzenie!
            </h1>
            <Button
              onClick={() => {
                // void event.mutateAsync().then((data) => {
                //   void router.push({
                //     pathname: "/event/[slug]/settings",
                //     query: { slug: data.ownersSlug },
                //   });
                // });
              }}
              variant="secondary"
              // disabled={event.isPending || event.isSuccess}
              className="rounded-md bg-secondary px-8 py-8 text-lg font-bold"
            >
              {/* {event.isPending || event.isSuccess ? (
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              ) : null} */}
              Utwórz wydarzenie
            </Button>
          </div>
        </div>
        <div>
          <MacbookScroll src={visionImage.src} />
        </div>
        <div className="relative">
          <div className="bottom-0 left-0 right-0 top-0 flex items-center justify-center xl:absolute">
            <motion.div
              animate={{ y: [-10, 20, -10] }}
              transition={{ ease: "easeOut", duration: 3, repeat: Infinity }}
              className="-left-48 top-0 xl:absolute"
            >
              <Image alt="Sphere" src={sphere} className="hidden 2xl:block" />
            </motion.div>
            <motion.div
              animate={{ y: [30, -30, 30] }}
              transition={{ ease: "easeOut", duration: 5, repeat: Infinity }}
              className="top-48 xl:absolute"
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
