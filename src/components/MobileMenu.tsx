"use client";

import Link from "next/link";
import { NAV_ITEMS, PHONE, PHONE_HREF } from "@/data/nav";

type MobileMenuProps = {
  isAuthenticated: boolean;
  isOpen: boolean;
  onClose: () => void;
};

export function MobileMenu({ isAuthenticated, isOpen, onClose }: MobileMenuProps) {
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
      {isAuthenticated ? (
        <Link href="/dashboard" onClick={onClose}>
          Личный кабинет
        </Link>
      ) : (
        <>
          <Link href="/login" onClick={onClose}>
            Вход
          </Link>
          <Link href="/register" onClick={onClose}>
            Регистрация
          </Link>
        </>
      )}
    </div>
  );
}
