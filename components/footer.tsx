import Link from "next/link";
import { Wordmark } from "@/components/logo";
import { navLinks, site } from "@/lib/site";
import styles from "@/components/experience/spatial-navigation.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Link href="/" aria-label="Nabla AI home"><Wordmark /></Link>
      <span className={styles.footerMeta}>{site.locations}</span>
      <nav className={styles.footerNav} aria-label="Footer">
        {navLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        <a className={styles.footerSocial} href={site.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Nabla Dynamics on LinkedIn">LinkedIn</a>
      </nav>
    </footer>
  );
}
