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

function normalizeOptionalString(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Необходима авторизация." }, { status: 401 });
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

  const createdRequest = await prisma.$transaction(async (tx) => {
    const request = await tx.request.create({
      data: {
        userId: user.id,
        name,
        phone,
        email,
        serviceType,
        material,
        quantity,
        description,
        status: "NEW"
      }
    });

    await createRequestStatusHistory(
      {
        requestId: request.id,
        oldStatus: null,
        newStatus: "NEW",
        changedById: user.id,
        actorType: "USER",
        comment: "Заявка создана пользователем."
      },
      tx
    );

    return request;
  });

  if (files.length > 0) {
    const savedFiles = await Promise.all(files.map((file) => saveRequestFile(file, createdRequest.id)));

    await prisma.requestFile.createMany({
      data: savedFiles.map((file) => ({
        requestId: createdRequest.id,
        ...file
      }))
    });
  }

  const requestWithFiles = await prisma.request.findUnique({
    where: {
      id: createdRequest.id
    },
    include: {
      files: true
    }
  });

  return NextResponse.json({ request: requestWithFiles }, { status: 201 });
}
