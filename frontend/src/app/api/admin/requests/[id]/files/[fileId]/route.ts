import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteUploadedRequestFile, RequestFileValidationError } from "@/lib/request-files";

type DeleteAdminRequestFileRouteContext = {
  params: Promise<{
    id: string;
    fileId: string;
  }>;
};

export async function DELETE(_request: Request, { params }: DeleteAdminRequestFileRouteContext) {
  const admin = await getCurrentUser();

  if (!admin) {
    return NextResponse.json({ error: "Необходима авторизация." }, { status: 401 });
  }

  if (admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Недостаточно прав." }, { status: 403 });
  }

  const { id, fileId } = await params;

  const request = await prisma.request.findUnique({
    where: { id },
    select: {
      id: true,
      status: true
    }
  });

  if (!request) {
    return NextResponse.json({ error: "Заявка не найдена." }, { status: 404 });
  }

  const file = await prisma.requestFile.findFirst({
    where: {
      id: fileId,
      requestId: request.id
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
    prisma.requestFile.delete({
      where: { id: file.id }
    }),
    prisma.requestStatusHistory.create({
      data: {
        requestId: request.id,
        oldStatus: request.status,
        newStatus: request.status,
        actorType: "ADMIN",
        changedById: admin.id,
        comment: `Администратор удалил файл: ${fileLabel}`
      }
    })
  ]);

  return NextResponse.json({ success: true });
}
