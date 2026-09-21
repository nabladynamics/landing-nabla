import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Approach } from "@/components/sections/approach";
import { CtaBand } from "@/components/sections/cta-band";
import { Hero } from "@/components/sections/hero";
import { Problem } from "@/components/sections/problem";
import { Team } from "@/components/sections/team";
import { Vision } from "@/components/sections/vision";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <Problem />
        <Approach />
        <Vision />
        <Team />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
