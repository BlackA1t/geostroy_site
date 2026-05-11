import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireUser();

  return (
    <main>
      <section className="section dashboard-page dashboard-section">
        <div className="dashboard-layout">
          <DashboardSidebar />
          <div className="dashboard-content">{children}</div>
        </div>
      </section>
    </main>
  );
}
