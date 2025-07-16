import React from "react";

import { AuthButton } from "@/components/auth-button";
import { AboutApp } from "@/components/landing/about-app";
import { AboutUs } from "@/components/landing/about-us";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto">
        <div className="bg-background absolute inset-x-0 z-50 container mx-auto min-w-screen">
          <header className="container mx-auto flex justify-between p-4">
            <Navbar authButton={<AuthButton />} />
          </header>
          <div className="container mx-auto flex p-4">
            <div className="w-full px-2 sm:px-6 lg:px-8">
              <Hero />
              <AboutApp />
            </div>
          </div>
          <AboutUs />
          <Footer />
        </div>
      </div>
    </div>
  );
}
