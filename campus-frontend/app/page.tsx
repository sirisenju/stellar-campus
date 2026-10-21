import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import {
  HowItWorks,
  FeaturedChallenges,
} from "@/components/landing/challenges";
import {
  VerificationFeature,
  SorobanFeature,
  PortfolioFeature,
  FinalCallToAction,
} from "@/components/landing/feature-panels";
import { Footer } from "@/components/landing/footer";
import { PreviewController } from "@/components/landing/preview-dialog";

export default function Home() {
  return (
    <div id="top" className="landing-page">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <main id="main-content">
        <Hero />
        <HowItWorks />
        <FeaturedChallenges />
        <VerificationFeature />
        <SorobanFeature />
        <PortfolioFeature />
        <FinalCallToAction />
      </main>
      <Footer />
      <PreviewController />
    </div>
  );
}
