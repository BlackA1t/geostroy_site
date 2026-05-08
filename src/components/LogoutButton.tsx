"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    await fetch("/api/auth/logout", {
      method: "POST"
    });

    router.push("/login");
    router.refresh();
  }

  return (
    <button className="btn btn-outline dashboard-logout" type="button" onClick={handleLogout} disabled={isLoading}>
      {isLoading ? "Выход..." : "Выйти"}
    </button>
  );
}
