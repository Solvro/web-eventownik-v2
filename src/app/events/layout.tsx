import Image from "next/image";

import { Footer } from "@/app/(homepage)/sections/footer";
import { Navbar } from "@/app/(homepage)/sections/navbar";

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="text-foreground min-h-screen">
      <div className="relative flex min-h-screen w-full flex-col bg-gradient-to-r from-[#E9EAEE] to-[#6f83af] dark:from-[#101011] dark:to-[#213560]">
        <div className="z-10 flex w-full flex-col items-center pt-4 lg:pt-12">
          <Navbar />
        </div>

        <Image
          src={"/assets/landing/footer_bg.jpg"}
          alt=""
          width={3000}
          height={3000}
          className="absolute inset-0 h-full w-full [mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)] opacity-10"
        />

        <main className="relative flex-1">{children}</main>
      </div>

      <div className="border-input flex w-full flex-col items-center border-t border-dashed bg-white dark:bg-[#101011]">
        <Footer />
      </div>
    </div>
  );
}
