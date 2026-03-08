import Header from "@/components/layout/Header";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import AboutSection from "@/components/AboutSection";
import PropertiesSection from "@/components/PropertiesSection";
import HotProjectsSection from "@/components/HotProjectsSection";
import WhyChooseUsSection from "@/components/WhyChooseUsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f6f6f8] text-slate-900">
      <Header />
      <HeroSection />
      <StatsSection />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-20 py-8 sm:py-10 lg:py-12">
        <AboutSection />
        <PropertiesSection />
        <WhyChooseUsSection />
        <HotProjectsSection />
        <TestimonialsSection />
      </main>

      <CTASection />
      <Footer />
    </div>
  );
}
