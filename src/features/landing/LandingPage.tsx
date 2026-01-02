import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { StatsSection } from "./components/StatsSection";
import { AboutSection } from "./components/AboutSection";
import { ProgramsSection } from "./components/ProgramsSection";
import { TeachersSection } from "./components/TeachersSection";
import { MethodSection } from "./components/MethodSection";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { ContactSection } from "./components/ContactSection";
import { Footer } from "./components/Footer";

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <AboutSection />
        <ProgramsSection />
        <TeachersSection />
        <MethodSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
