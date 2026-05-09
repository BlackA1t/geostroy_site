"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ClientEffects } from "./ClientEffects";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MobileMenu } from "./MobileMenu";
import type { HeaderNotification } from "./NotificationBell";
import { ScrollTopButton } from "./ScrollTopButton";

type SiteShellProps = {
  children: ReactNode;
  currentUserRole: string | null;
  isAuthenticated: boolean;
  recentNotifications: HeaderNotification[];
  unreadNotificationsCount: number;
  userEmail: string | null;
  userName: string | null;
};

export function SiteShell({
  children,
  currentUserRole,
  isAuthenticated,
  recentNotifications,
  unreadNotificationsCount,
  userEmail,
  userName
}: SiteShellProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollTopVisible, setIsScrollTopVisible] = useState(false);

  const closeMobileMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    closeMobileMenu();
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setIsScrollTopVisible(window.scrollY > 500);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1180) closeMobileMenu();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobileMenu();
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <Header
        currentUserRole={currentUserRole}
        isAuthenticated={isAuthenticated}
        isMenuOpen={isMenuOpen}
        isScrolled={isScrolled}
        recentNotifications={recentNotifications}
        unreadNotificationsCount={unreadNotificationsCount}
        userEmail={userEmail}
        userName={userName}
        onToggleMenu={() => setIsMenuOpen((current) => !current)}
      />
      <MobileMenu
        currentUserRole={currentUserRole}
        isAuthenticated={isAuthenticated}
        isOpen={isMenuOpen}
        onClose={closeMobileMenu}
      />
      {children}
      <Footer />
      <ScrollTopButton isVisible={isScrollTopVisible} />
      <ClientEffects />
    </>
  );
}
