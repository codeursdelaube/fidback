import { Hero } from "@/components/marketing/Hero";
import { Stats } from "@/components/marketing/Stats";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Features } from "@/components/marketing/Features";
import { Pricing } from "@/components/marketing/Pricing";
import { Testimonials } from "@/components/marketing/Testimonials";
import { CtaBanner } from "@/components/marketing/CtaBanner";

export default function HomePage() {
  return (
    <div className="space-y-0">
      <Hero />
      <Stats />
      <HowItWorks />
      <Features />
      <Pricing />
      <Testimonials />
      <CtaBanner />
    </div>
  );
}
