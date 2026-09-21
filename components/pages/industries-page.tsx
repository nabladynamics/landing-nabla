import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { CtaBand } from "@/components/sections/cta-band";
import { IndustriesGrid } from "@/components/sections/industries-grid";
import { PageHeader } from "@/components/ui/page-header";

export default function IndustriesPage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <PageHeader
          title="Every shape that meets a fluid"
          lede="From flight and transport to power generation, we are developing a CFD engine to help engineers explore complex flows. Faster simulations, lower costs and greater detail are the goals guiding our work."
        />
        <IndustriesGrid />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
