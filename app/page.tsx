"use client";

import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import ScrollSequence from "@/components/ScrollSequence";
import PortfolioSection from "@/components/PortfolioSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTAFooterSection from "@/components/CTAFooterSection";

export default function Home() {
  return (
    <>
      <NavBar />

      <main>
        <HeroSection />
        <ScrollSequence />
        <PortfolioSection />
        <AboutSection />
        <ServicesSection />
        <TestimonialsSection />
      </main>

      <CTAFooterSection />
    </>
  );
}
