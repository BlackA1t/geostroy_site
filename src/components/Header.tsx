"use client";

import Link from "next/link";
import { NAV_ITEMS, PHONE, PHONE_HREF } from "@/data/nav";

type HeaderProps = {
  currentUserRole: string | null;
  isAuthenticated: boolean;
  isMenuOpen: boolean;
  isScrolled: boolean;
  onToggleMenu: () => void;
};

export function Header({ currentUserRole, isAuthenticated, isMenuOpen, isScrolled, onToggleMenu }: HeaderProps) {
  return (
    <header className={`header${isScrolled ? " scrolled" : ""}`} id="header">
      <div className="header-inner">
        <Link href="/" className="logo">
          <img src="/assets/img/logo.png" alt="Логотип ООО Геострой" className="logo-img" />
          <div className="logo-text">
            Гео<span>строй</span>
          </div>
        </Link>
        <nav className="nav">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <a href={PHONE_HREF} className="nav-phone">
            {PHONE}
          </a>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">Личный кабинет</Link>
              <Link href="/dashboard/notifications">Уведомления</Link>
              {currentUserRole === "ADMIN" ? <Link href="/admin">Админ-панель</Link> : null}
            </>
          ) : (
            <>
              <Link href="/login">Вход</Link>
              <Link href="/register">Регистрация</Link>
            </>
          )}
        </nav>
        <div
          className={`burger${isMenuOpen ? " active" : ""}`}
          id="burger"
          aria-label="Открыть меню"
          role="button"
          tabIndex={0}
          onClick={onToggleMenu}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onToggleMenu();
            }
          }}
        >
          <span />
          <span />
          <span />
        </div>
      </div>
    </header>
  );
}
