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
  const comment = typeof body?.comment === "string" ? body.comment.trim().slice(0, 1000) : "";

  if (!isCallbackStatus(status)) {
    return NextResponse.json({ error: "Некорректный статус." }, { status: 400 });
  }

  const { id } = await params;
  const existingRequest = await prisma.callbackRequest.findUnique({
    where: { id }
  });

  if (!existingRequest) {
    return NextResponse.json({ error: "Обращение не найдено." }, { status: 404 });
  }

  if (existingRequest.status === status && !comment) {
    return NextResponse.json(
      { error: "Измените статус или добавьте комментарий." },
      { status: 400 }
    );
  }

  const callbackRequest = await prisma.$transaction(async (tx) => {
    const updated = existingRequest.status === status
      ? existingRequest
      : await tx.callbackRequest.update({
          where: { id },
          data: { status }
        });

    await tx.callbackRequestStatusHistory.create({
      data: {
        callbackRequestId: id,
        oldStatus: existingRequest.status,
        newStatus: status,
        comment: comment || null,
        changedById: user.id
      }
    });

    return updated;
  });

  return NextResponse.json({ callbackRequest, success: true });
}
