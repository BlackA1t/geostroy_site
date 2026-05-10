import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteUploadedRequestFile, RequestFileValidationError } from "@/lib/request-files";

type DeleteAdminGuestRequestFileRouteContext = {
  params: Promise<{
    id: string;
    fileId: string;
  }>;
};

export async function DELETE(_request: Request, { params }: DeleteAdminGuestRequestFileRouteContext) {
  const admin = await getCurrentUser();

  if (!admin) {
    return NextResponse.json({ error: "Необходима авторизация." }, { status: 401 });
  }

  if (admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Недостаточно прав." }, { status: 403 });
  }

  const { id, fileId } = await params;

  const guestRequest = await prisma.guestRequest.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      claimedAt: true
    }
  });

  if (!guestRequest) {
    return NextResponse.json({ error: "Гостевая заявка не найдена." }, { status: 404 });
  }

  if (guestRequest.claimedAt) {
    return NextResponse.json({ error: "Гостевая заявка уже привязана к пользователю." }, { status: 409 });
  }

  const file = await prisma.guestRequestFile.findFirst({
    where: {
      id: fileId,
      guestRequestId: guestRequest.id
    },
    select: {
      id: true,
      fileUrl: true,
      fileName: true,
      originalName: true
    }
  });

  if (!file) {
    return NextResponse.json({ error: "Файл не найден." }, { status: 404 });
  }

  try {
    await deleteUploadedRequestFile(file.fileUrl);
  } catch (error) {
    if (error instanceof RequestFileValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Не удалось удалить файл." }, { status: 500 });
  }

  const fileLabel = file.originalName || file.fileName;

  await prisma.$transaction([
    prisma.guestRequestFile.delete({
      where: { id: file.id }
    }),
    prisma.requestStatusHistory.create({
      data: {
        guestRequestId: guestRequest.id,
        oldStatus: guestRequest.status,
        newStatus: guestRequest.status,
        actorType: "ADMIN",
        changedById: admin.id,
        comment: `Администратор удалил файл: ${fileLabel}`
      }
    })
  ]);

  return NextResponse.json({ success: true });
}
