import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Contact } from "@/components/sections/contact";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Contact standalone />
      </main>
      <Footer />
    </>
  );
}
