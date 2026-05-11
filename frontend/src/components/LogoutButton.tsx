"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { backendAuthClient } from "@/lib/backend-auth-client";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    await backendAuthClient.logout().catch(() => undefined);

    router.push("/login");
    router.refresh();
  }

  return (
    <button className="btn btn-outline dashboard-logout" type="button" onClick={handleLogout} disabled={isLoading}>
      {isLoading ? "Выход..." : "Выйти"}
    </button>
  );
}
