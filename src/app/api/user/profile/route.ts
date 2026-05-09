import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function normalizeOptionalString(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Необходима авторизация." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const phone = normalizeOptionalString(body?.phone);

  if (!name || !email) {
    return NextResponse.json({ error: "Заполните имя и email." }, { status: 400 });
  }

  if (!isEmail(email)) {
    return NextResponse.json({ error: "Укажите корректный email." }, { status: 400 });
  }

  if (email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (existingUser && existingUser.id !== user.id) {
      return NextResponse.json({ error: "Этот email уже занят." }, { status: 409 });
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      email,
      phone
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return NextResponse.json({ user: updatedUser });
}
