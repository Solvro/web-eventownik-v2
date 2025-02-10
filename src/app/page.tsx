import { AboutApp } from "@/components/landing/about-app";
import { AboutUs } from "@/components/landing/about-us";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Navbar } from "@/components/landing/navbar";

export default function Home() {
  return (
    <div className="bg-[#152959]">
      <Navbar />
      <Hero />
      <AboutApp />
      <AboutUs />
      <Footer />
    </div>
  );
}
