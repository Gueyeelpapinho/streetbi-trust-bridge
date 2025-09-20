import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { RecentReports } from "@/components/RecentReports";
import { InteractiveMap } from "@/components/InteractiveMap";
import { AboutSection } from "@/components/AboutSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <RecentReports />
        <InteractiveMap />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
