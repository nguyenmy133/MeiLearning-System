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
import { SectionDivider } from "./components/SectionDivider";

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <div className="relative">
          <HeroSection />
          <SectionDivider type="curve" className="fill-background" />
        </div>
        
        <StatsSection />
        
        <div className="relative">
          <AboutSection />
          {/* Accent/30 matches ProgramsSection background */}
          <SectionDivider type="tilt" className="fill-accent/30" />
        </div>
        
        <div className="relative">
          <ProgramsSection />
          {/* Background matches TeachersSection background */}
          <SectionDivider type="wave" className="fill-background" />
        </div>
        
        <TeachersSection />
        
        <div className="relative">
          <MethodSection />
          <SectionDivider type="steps" className="fill-background" position="top" flipped />
        </div>
        
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
