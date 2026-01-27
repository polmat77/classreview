import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ToolsSection from "@/components/landing/ToolsSection";
import TestimonialSection from "@/components/landing/TestimonialSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const LandingPage = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#1a2332] overflow-x-hidden">
      <Navbar onScrollToSection={scrollToSection} />
      <HeroSection onScrollToSection={scrollToSection} />
      <ToolsSection />
      <TestimonialSection />
      <FAQSection />
      <CTASection />
      <Footer onScrollToSection={scrollToSection} />
    </div>
  );
};

export default LandingPage;
