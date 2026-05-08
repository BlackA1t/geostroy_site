import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getUploadedFiles,
  RequestFileValidationError,
  saveRequestFile,
  validateUploadedFiles
} from "@/lib/request-files";
import { createRequestStatusHistory } from "@/lib/status-history";

export const runtime = "nodejs";

type RequestRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function normalizeOptionalString(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

export async function PATCH(request: Request, { params }: RequestRouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Необходима авторизация." }, { status: 401 });
  }

  const { id } = await params;

  const existingRequest = await prisma.request.findFirst({
    where: {
      id,
      userId: user.id
    }
  });

  if (!existingRequest) {
    return NextResponse.json({ error: "Заявка не найдена." }, { status: 404 });
  }

  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return NextResponse.json({ error: "Некорректные данные формы." }, { status: 400 });
  }

  const serviceType = String(formData.get("serviceType") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = normalizeOptionalString(formData.get("email")) ?? user.email;
  const material = normalizeOptionalString(formData.get("material"));
  const quantity = normalizeOptionalString(formData.get("quantity"));
  const files = getUploadedFiles(formData);

  if (!serviceType || !description || !name || !phone) {
    return NextResponse.json(
      { error: "Заполните тип услуги, описание задачи, имя и телефон." },
      { status: 400 }
    );
  }

  try {
    validateUploadedFiles(files);
  } catch (error) {
    if (error instanceof RequestFileValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    throw error;
  }

  const updatedRequest = await prisma.$transaction(async (tx) => {
    const updated = await tx.request.update({
      where: {
        id: existingRequest.id
      },
      data: {
        serviceType,
        description,
        name,
        phone,
        email,
        material,
        quantity,
        status: "NEW"
      }
    });

    if (existingRequest.status !== "NEW") {
      await createRequestStatusHistory(
        {
          requestId: existingRequest.id,
          oldStatus: existingRequest.status,
          newStatus: "NEW",
          changedById: user.id,
          actorType: "SYSTEM",
          comment: "Пользователь изменил данные заявки. Статус автоматически сброшен на «Новая»."
        },
        tx
      );
    }

    return updated;
  });

  if (files.length > 0) {
    const savedFiles = await Promise.all(files.map((file) => saveRequestFile(file, updatedRequest.id)));

    await prisma.requestFile.createMany({
      data: savedFiles.map((file) => ({
        requestId: updatedRequest.id,
        ...file
      }))
    });
  }

  const requestWithFiles = await prisma.request.findUnique({
    where: {
      id: updatedRequest.id
    },
    include: {
      files: true
    }
  });

  return NextResponse.json({ request: requestWithFiles });
}
