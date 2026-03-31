"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/ui/Navigation";
import Hero from "@/components/sections/Hero";
import TheSetting from "@/components/sections/TheSetting";
import TheLodge from "@/components/sections/TheLodge";
import TheRooms from "@/components/sections/TheRooms";
import TheExperience from "@/components/sections/TheExperience";
import BookingCTA from "@/components/sections/BookingCTA";
import Footer from "@/components/sections/Footer";

export default function Home() {
  const pathname = usePathname();

  return (
    <main className="grain" key={pathname}>
      <Navigation />
      <Hero />
      <TheLodge />
      <TheRooms />
      <TheSetting />
      <BookingCTA />
      <TheExperience />
      <Footer />
    </main>
  );
}
