import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Comparison } from "@/components/sections/comparison";
import { CtaBand } from "@/components/sections/cta-band";
import { Technology } from "@/components/sections/technology";
import { PageHeader } from "@/components/ui/page-header";
import { Steps } from "@/components/ui/steps";
import { container } from "@/lib/site";

export default function PlatformPage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <PageHeader
          title="From STL to resolved flow. Nothing in between."
          lede="Nabla is a CFD engine with no volume mesh to build and no parameters to tune. Upload a geometry, run, and read results that depend on the physics, not on who set up the case."
        />
        <section className="pb-24 pt-10 md:pb-28 md:pt-14">
          <div className={container}>
            <Steps />
          </div>
        </section>
        <Technology />
        <Comparison />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
