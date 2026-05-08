import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isRequestStatus } from "@/lib/request-status";
import { createRequestStatusHistory } from "@/lib/status-history";

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
  const comment = typeof body?.comment === "string" ? body.comment.trim().slice(0, 1000) : null;

  if (!isRequestStatus(status)) {
    return NextResponse.json({ error: "Некорректный статус." }, { status: 400 });
  }

  const { id } = await params;
  const existingRequest = await prisma.request.findUnique({
    where: { id }
  });

  if (!existingRequest) {
    return NextResponse.json({ error: "Заявка не найдена." }, { status: 404 });
  }

  if (existingRequest.status === status) {
    return NextResponse.json({ request: existingRequest });
  }

  const updatedRequest = await prisma.$transaction(async (tx) => {
    const updated = await tx.request.update({
      where: { id },
      data: { status }
    });

    await createRequestStatusHistory(
      {
        requestId: id,
        oldStatus: existingRequest.status,
        newStatus: status,
        comment,
        changedById: user.id,
        actorType: "ADMIN"
      },
      tx
    );

    return updated;
  });

  return NextResponse.json({ request: updatedRequest });
}
