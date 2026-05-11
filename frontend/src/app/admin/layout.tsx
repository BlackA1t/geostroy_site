import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <main>
      <section className="section admin-page">
        <div className="admin-layout">
          <AdminSidebar />
          <div className="admin-content">{children}</div>
        </div>
      </section>
    </main>
  );
}
