"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const DASHBOARD_LINKS = [
  {
    href: "/dashboard",
    label: "Личный кабинет",
    exact: true
  },
  {
    href: "/dashboard/requests",
    label: "Мои заявки",
    exact: false
  },
  {
    href: "/dashboard/notifications",
    label: "Уведомления",
    exact: true
  }
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="dashboard-sidebar" aria-label="Навигация личного кабинета">
      <div className="dashboard-sidebar-title">Кабинет</div>
      <nav className="dashboard-sidebar-nav">
        {DASHBOARD_LINKS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href || pathname.startsWith("/dashboard/profile")
              : item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

          return (
            <Link
              className={`dashboard-sidebar-link${isActive ? " dashboard-sidebar-link-active" : ""}`}
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
