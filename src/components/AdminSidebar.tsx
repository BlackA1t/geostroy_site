"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_LINK_GROUPS = [
  {
    title: "Управление заявками",
    links: [
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
        href: "/admin/callback-requests",
        label: "Обратные звонки",
        exact: false
      }
    ]
  },
  {
    title: "Управление пользователями",
    links: [
      {
        href: "/admin/users",
        label: "Пользователи",
        exact: false
      }
    ]
  }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar" aria-label="Навигация админ-панели">
      <div className="admin-sidebar-title">Админ-панель</div>
      <nav className="admin-sidebar-nav">
        {ADMIN_LINK_GROUPS.map((group) => (
          <div className="admin-sidebar-group" key={group.title}>
            <div className="admin-sidebar-group-title">{group.title}</div>
            <div className="admin-sidebar-group-links">
              {group.links.map((item) => {
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
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
