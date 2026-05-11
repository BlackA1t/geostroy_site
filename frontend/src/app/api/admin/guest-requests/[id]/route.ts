import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isRequestStatus } from "@/lib/request-status";
import { createGuestRequestStatusHistory } from "@/lib/status-history";

type AdminGuestRequestRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: AdminGuestRequestRouteContext) {
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
  const existingGuestRequest = await prisma.guestRequest.findUnique({
    where: { id }
  });

  if (!existingGuestRequest) {
    return NextResponse.json({ error: "Гостевая заявка не найдена." }, { status: 404 });
  }

  if (existingGuestRequest.status === status) {
    return NextResponse.json({ guestRequest: existingGuestRequest });
  }

  const updatedGuestRequest = await prisma.$transaction(async (tx) => {
    const updated = await tx.guestRequest.update({
      where: { id },
      data: { status }
    });

    await createGuestRequestStatusHistory(
      {
        guestRequestId: id,
        oldStatus: existingGuestRequest.status,
        newStatus: status,
        comment,
        changedById: user.id,
        actorType: "ADMIN"
      },
      tx
    );

    return updated;
  });

  return NextResponse.json({ guestRequest: updatedGuestRequest });
}
