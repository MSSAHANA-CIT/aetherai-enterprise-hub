import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import ProductPreview from "../components/landing/ProductPreview";
import FeatureGrid from "../components/landing/FeatureGrid";
import DashboardPreview from "./DashboardPreview";
import Footer from "../components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main>
        <HeroSection />
        <ProductPreview />
        <FeatureGrid />
        <DashboardPreview />
      </main>
      <Footer />
    </div>
  );
}
