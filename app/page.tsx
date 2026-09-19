import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Approach } from "@/components/sections/approach";
import { Comparison } from "@/components/sections/comparison";
import { Contact } from "@/components/sections/contact";
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
        <Comparison />
        <Vision />
        <Team />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
