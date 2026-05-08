import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isRequestStatus } from "@/lib/request-status";

type AdminRequestRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: AdminRequestRouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Необходима авторизация." }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Недостаточно прав." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const status = body?.status;

  if (!isRequestStatus(status)) {
    return NextResponse.json({ error: "Некорректный статус." }, { status: 400 });
  }

  const { id } = await params;

  const updatedRequest = await prisma.request.update({
    where: { id },
    data: { status }
  });

  return NextResponse.json({ request: updatedRequest });
}
