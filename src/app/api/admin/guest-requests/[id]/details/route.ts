import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  buildAdminRequestEditComment,
  getAdminRequestDetailsChanges,
  parseAdminRequestDetailsInput
} from "@/lib/admin-request-edit";
import { prisma } from "@/lib/prisma";

type AdminGuestRequestDetailsRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: AdminGuestRequestDetailsRouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Необходима авторизация." }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Недостаточно прав." }, { status: 403 });
  }

  const { id } = await params;
  const existingRequest = await prisma.guestRequest.findUnique({
    where: { id }
  });

  if (!existingRequest) {
    return NextResponse.json({ error: "Гостевая заявка не найдена." }, { status: 404 });
  }

  if (existingRequest.claimedAt) {
    return NextResponse.json(
      { error: "Гостевая заявка уже привязана к пользователю." },
      { status: 409 }
    );
  }

  const body = await request.json().catch(() => null);
  let input;

  try {
    input = parseAdminRequestDetailsInput(body);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Некорректные данные." },
      { status: 400 }
    );
  }

  const changes = getAdminRequestDetailsChanges(existingRequest, input);

  if (changes.length === 0) {
    return NextResponse.json({ error: "Нет изменений для сохранения." }, { status: 400 });
  }

  const updatedRequest = await prisma.$transaction(async (tx) => {
    const updated = await tx.guestRequest.update({
      where: { id },
      data: input
    });

    await tx.requestStatusHistory.create({
      data: {
        guestRequestId: id,
        oldStatus: existingRequest.status,
        newStatus: existingRequest.status,
        comment: buildAdminRequestEditComment(changes),
        changedById: user.id,
        actorType: "ADMIN"
      }
    });

    return updated;
  });

  return NextResponse.json({ request: updatedRequest, success: true });
}
