"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { backendAuthClient } from "@/lib/backend-auth-client";

type ProfileMenuProps = {
  isAdmin?: boolean;
  userEmail?: string | null;
  userName?: string | null;
};

function ProfileIcon() {
  return (
    <svg className="profile-menu-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M20 21a8 8 0 0 0-16 0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function ProfileMenu({ isAdmin = false, userEmail, userName }: ProfileMenuProps) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  async function handleLogout() {
    setIsLoggingOut(true);

    await backendAuthClient.logout().catch(() => undefined);

    router.push("/login");
    router.refresh();
  }

  return (
    <div className="profile-menu" ref={wrapperRef}>
      <button
        className="profile-menu-button"
        type="button"
        aria-expanded={isOpen}
        aria-label="Меню профиля"
        title="Меню профиля"
        onClick={() => setIsOpen((current) => !current)}
      >
        <ProfileIcon />
      </button>

      {isOpen ? (
        <div className="profile-dropdown" role="dialog" aria-label="Меню профиля">
          {(userName || userEmail) ? (
            <div className="profile-dropdown-user">
              {userName ? <strong>{userName}</strong> : null}
              {userEmail ? <span>{userEmail}</span> : null}
            </div>
          ) : null}

          <Link className="profile-dropdown-link" href="/dashboard" onClick={() => setIsOpen(false)}>
            Личный кабинет
          </Link>
          <Link className="profile-dropdown-link" href="/dashboard/requests" onClick={() => setIsOpen(false)}>
            Мои заявки
          </Link>
          {isAdmin ? (
            <Link className="profile-dropdown-link" href="/admin" onClick={() => setIsOpen(false)}>
              Админ-панель
            </Link>
          ) : null}
          <button
            className="profile-dropdown-logout"
            type="button"
            disabled={isLoggingOut}
            onClick={handleLogout}
          >
            {isLoggingOut ? "Выход..." : "Выйти"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
