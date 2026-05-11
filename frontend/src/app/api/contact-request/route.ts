import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validatePhone } from "@/lib/contact-validation";
import { generateGuestRequestToken, hashGuestRequestToken, setGuestRequestCookie } from "@/lib/guest-request";
import { prisma } from "@/lib/prisma";
import { normalizeQuantity } from "@/lib/quantity";
import {
  getUploadedFiles,
  RequestFileValidationError,
  saveRequestFile,
  validateUploadedFiles
} from "@/lib/request-files";
import { createGuestRequestStatusHistory, createRequestStatusHistory } from "@/lib/status-history";

export const runtime = "nodejs";

function normalizeOptionalString(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return NextResponse.json({ error: "Некорректные данные формы." }, { status: 400 });
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const serviceType = String(formData.get("serviceType") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const email = normalizeOptionalString(formData.get("email"))?.toLowerCase() ?? null;
  const material = normalizeOptionalString(formData.get("material"));
  const files = getUploadedFiles(formData);
  let quantity: string | null = null;

  if (!name || !phone || !serviceType || !description) {
    return NextResponse.json(
      { error: "Заполните имя, телефон, тип услуги и описание задачи." },
      { status: 400 }
    );
  }

  const phoneError = validatePhone(phone);
  if (phoneError) {
    return NextResponse.json({ error: phoneError }, { status: 400 });
  }

  try {
    quantity = normalizeQuantity(formData.get("quantity"));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Некорректное количество." },
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

  const user = await getCurrentUser();

  if (user) {
    const createdRequest = await prisma.$transaction(async (tx) => {
      const request = await tx.request.create({
        data: {
          userId: user.id,
          name,
          phone,
          email: email ?? user.email,
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

    return NextResponse.json({
      type: "authenticated",
      requestId: createdRequest.id,
      message: "Заявка создана и доступна в личном кабинете."
    });
  }

  const claimToken = generateGuestRequestToken();

  const guestRequest = await prisma.$transaction(async (tx) => {
    const createdGuestRequest = await tx.guestRequest.create({
      data: {
        name,
        phone,
        email,
        serviceType,
        material,
        quantity,
        description,
        status: "NEW",
        claimTokenHash: hashGuestRequestToken(claimToken)
      }
    });

    await createGuestRequestStatusHistory(
      {
        guestRequestId: createdGuestRequest.id,
        oldStatus: null,
        newStatus: "NEW",
        changedById: null,
        actorType: "SYSTEM",
        comment: "Гостевая заявка создана через форму контактов."
      },
      tx
    );

    return createdGuestRequest;
  });

  if (files.length > 0) {
    const savedFiles = await Promise.all(files.map((file) => saveRequestFile(file, `guest-${guestRequest.id}`)));

    await prisma.guestRequestFile.createMany({
      data: savedFiles.map((file) => ({
        guestRequestId: guestRequest.id,
        ...file
      }))
    });
  }

  await setGuestRequestCookie(claimToken);

  return NextResponse.json({
    type: "guest",
    guestRequestId: guestRequest.id,
    message: "Заявка отправлена. Войдите или зарегистрируйтесь, чтобы отслеживать статус заявки."
  });
}
