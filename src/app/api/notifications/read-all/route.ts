import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { markAllNotificationsAsRead } from "@/lib/notifications";

export async function PATCH() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Необходима авторизация." }, { status: 401 });
  }

  const result = await markAllNotificationsAsRead(user.id);

  return NextResponse.json({ success: true, updatedCount: result.count });
}
