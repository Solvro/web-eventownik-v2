import Link from "next/link";
import React from "react";

import { AuthButton } from "@/components/auth-button";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="container mx-auto">
        <div className="bg-background absolute inset-x-0 z-50 container mx-auto min-w-screen">
          <header className="container mx-auto flex justify-between p-4">
            <Navbar authButton={<AuthButton />} />
          </header>
        </div>
        <iframe
          src="https://legacy.eventownik.solvro.pl/"
          className="absolute inset-0 h-screen w-screen"
          title="Eventownik Legacy"
        />
        <p className="bg-background/50 absolute bottom-0 left-0 z-50 h-fit w-full text-center text-sm backdrop-blur-3xl">
          Korzystając z platformy, zgadzasz się na warunki zawarte w jej{" "}
          <Link
            href="https://drive.google.com/file/d/1h4f-koiR-Ab2JPrOe7p5JXjohi83mrvB/view"
            className="text-primary/90"
            target="_blank"
          >
            regulaminie
          </Link>
        </p>
      </div>
    </div>
  );
}
