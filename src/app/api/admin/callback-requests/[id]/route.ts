import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isCallbackStatus } from "@/lib/callback-status";
import { prisma } from "@/lib/prisma";

type AdminCallbackRequestRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: AdminCallbackRequestRouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Необходима авторизация." }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Недостаточно прав." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const status = body?.status;

  if (!isCallbackStatus(status)) {
    return NextResponse.json({ error: "Некорректный статус." }, { status: 400 });
  }

  const { id } = await params;
  const callbackRequest = await prisma.callbackRequest.update({
    where: { id },
    data: { status }
  });

  return NextResponse.json({ callbackRequest });
}
