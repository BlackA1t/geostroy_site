import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { markNotificationAsRead } from "@/lib/notifications";

type NotificationReadRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(_request: Request, { params }: NotificationReadRouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Необходима авторизация." }, { status: 401 });
  }

  const { id } = await params;
  const result = await markNotificationAsRead(id, user.id);

  return NextResponse.json({ success: true, updatedCount: result.count });
}
