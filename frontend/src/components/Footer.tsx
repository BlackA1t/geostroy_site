import Link from "next/link";
import { NAV_ITEMS } from "@/data/nav";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-copy">© 2026 ООО «Геострой». Все права защищены.</div>
        <div className="footer-links">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
