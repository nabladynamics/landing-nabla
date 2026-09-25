import { permanentRedirect } from "next/navigation";

// Keep bookmarks working; static /experience/* assets keep their own URLs.
export default function ExperiencePage() {
  permanentRedirect("/");
}
