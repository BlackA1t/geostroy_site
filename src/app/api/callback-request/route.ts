import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizeOptionalString(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const phone = String(body?.phone ?? "").trim();
  const name = normalizeOptionalString(body?.name);

  if (!phone) {
    return NextResponse.json({ error: "Укажите телефон." }, { status: 400 });
  }

  if (phone.length < 5 || phone.length > 30) {
    return NextResponse.json({ error: "Телефон должен содержать от 5 до 30 символов." }, { status: 400 });
  }

  const callbackRequest = await prisma.callbackRequest.create({
    data: {
      name,
      phone,
      status: "NEW"
    }
  });

  return NextResponse.json({ success: true, callbackRequestId: callbackRequest.id }, { status: 201 });
}
