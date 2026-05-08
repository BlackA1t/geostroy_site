import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateGuestRequestToken, hashGuestRequestToken, setGuestRequestCookie } from "@/lib/guest-request";
import { prisma } from "@/lib/prisma";

function normalizeOptionalString(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Некорректные данные формы." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const serviceType = String(body.serviceType ?? "").trim();
  const description = String(body.description ?? "").trim();
  const email = normalizeOptionalString(body.email);
  const material = normalizeOptionalString(body.material);
  const quantity = normalizeOptionalString(body.quantity);

  if (!name || !phone || !serviceType || !description) {
    return NextResponse.json(
      { error: "Заполните имя, телефон, тип услуги и описание задачи." },
      { status: 400 }
    );
  }

  const user = await getCurrentUser();

  if (user) {
    const createdRequest = await prisma.request.create({
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

    return NextResponse.json({
      type: "authenticated",
      requestId: createdRequest.id,
      message: "Заявка создана и доступна в личном кабинете."
    });
  }

  const claimToken = generateGuestRequestToken();

  const guestRequest = await prisma.guestRequest.create({
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

  await setGuestRequestCookie(claimToken);

  return NextResponse.json({
    type: "guest",
    guestRequestId: guestRequest.id,
    message: "Заявка отправлена. Войдите или зарегистрируйтесь, чтобы отслеживать статус заявки."
  });
}
