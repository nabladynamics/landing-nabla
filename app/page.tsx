import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Applications } from "@/components/sections/applications";
import { Contact } from "@/components/sections/contact";
import { Differentiation } from "@/components/sections/differentiation";
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
        <Differentiation />
        <Applications />
        <Vision />
        <Team />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
