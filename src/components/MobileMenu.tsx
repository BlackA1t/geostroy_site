"use client";

import Link from "next/link";
import { NAV_ITEMS, PHONE, PHONE_HREF } from "@/data/nav";

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <div className={`mobile-menu${isOpen ? " active" : ""}`} id="mobileMenu">
      {NAV_ITEMS.map((item) => (
        <Link key={item.href} href={item.href} onClick={onClose}>
          {item.label}
        </Link>
      ))}
      <a href={PHONE_HREF} className="mobile-phone" onClick={onClose}>
        {PHONE}
      </a>
    </div>
  );
}
