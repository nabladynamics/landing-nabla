import { SpatialExperience } from "@/components/experience/spatial-experience";
import { pageMetadata, websiteStructuredData } from "@/lib/seo";

export const metadata = pageMetadata("home");

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteStructuredData).replace(/</g, "\\u003c"),
        }}
      />
      <SpatialExperience />
    </>
  );
}
