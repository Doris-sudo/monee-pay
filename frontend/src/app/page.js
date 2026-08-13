import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import EscrowFlow from "@/components/EscrowFlow";
import StatsBar from "@/components/StatsBar";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <EscrowFlow />
      <StatsBar />
      <Features />
      <Footer />
    </main>
  );
}
