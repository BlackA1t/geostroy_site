import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function normalizeOptionalString(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Необходима авторизация." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Некорректные данные формы." }, { status: 400 });
  }

  const serviceType = String(body.serviceType ?? "").trim();
  const description = String(body.description ?? "").trim();
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const email = normalizeOptionalString(body.email) ?? user.email;
  const material = normalizeOptionalString(body.material);
  const quantity = normalizeOptionalString(body.quantity);

  if (!serviceType || !description || !name || !phone) {
    return NextResponse.json(
      { error: "Заполните тип услуги, описание задачи, имя и телефон." },
      { status: 400 }
    );
  }

  const createdRequest = await prisma.request.create({
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

  return NextResponse.json({ request: createdRequest }, { status: 201 });
}
