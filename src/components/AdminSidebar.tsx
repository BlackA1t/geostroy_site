"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_LINKS = [
  {
    href: "/admin",
    label: "Обзор",
    exact: true
  },
  {
    href: "/admin/requests",
    label: "Пользовательские заявки",
    exact: false
  },
  {
    href: "/admin/guest-requests",
    label: "Гостевые заявки",
    exact: false
  },
  {
    href: "/",
    label: "На сайт",
    exact: true
  }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar" aria-label="Навигация админ-панели">
      <div className="admin-sidebar-title">Админ-панель</div>
      <nav className="admin-sidebar-nav">
        {ADMIN_LINKS.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link
              className={`admin-sidebar-link${isActive ? " admin-sidebar-link-active" : ""}`}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
