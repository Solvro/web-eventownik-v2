import React from "react";

import { AuthButton } from "@/components/auth-button";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <div className="min-h-screen">
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
      </div>
    </div>
  );
}
