import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/SiteShell";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "ООО «Геострой» — ЧПУ металлообработка в Сарове",
  description:
    "Фрезерная, токарная и токарно-фрезерная обработка металлических изделий на станках с ЧПУ. Изготовление деталей по чертежам в Сарове.",
  icons: {
    icon: "/assets/img/logo.png",
    apple: "/assets/img/logo.png"
  }
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Oswald:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SiteShell currentUserRole={currentUser?.role ?? null} isAuthenticated={Boolean(currentUser)}>
          {children}
        </SiteShell>
      </body>
    </html>
  );
}
