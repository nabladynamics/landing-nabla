import { redirect } from "next/navigation";

// Keep the page implementation for a future release; old links return home.
export default function DeferredPlatformPage() {
  redirect("/");
}
