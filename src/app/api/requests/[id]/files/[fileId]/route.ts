import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteUploadedRequestFile, RequestFileValidationError } from "@/lib/request-files";
import { prisma } from "@/lib/prisma";

type DeleteRequestFileRouteContext = {
  params: Promise<{
    id: string;
    fileId: string;
  }>;
};

export async function DELETE(_request: Request, { params }: DeleteRequestFileRouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Необходима авторизация." }, { status: 401 });
  }

  const { id, fileId } = await params;

  const request = await prisma.request.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      status: true
    }
  });

  if (!request) {
    return NextResponse.json({ error: "Заявка не найдена." }, { status: 404 });
  }

  if (request.userId !== user.id) {
    return NextResponse.json({ error: "Нет доступа к этой заявке." }, { status: 403 });
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
        actorType: "USER",
        changedById: user.id,
        comment: `Пользователь удалил файл: ${fileLabel}`
      }
    })
  ]);

  return NextResponse.json({ success: true });
}
