import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

function getRequiredString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Необходима авторизация." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  const currentPassword = getRequiredString(body?.currentPassword);
  const newPassword = getRequiredString(body?.newPassword);
  const confirmPassword = getRequiredString(body?.confirmPassword);

  if (!currentPassword) {
    return NextResponse.json({ error: "Укажите текущий пароль" }, { status: 400 });
  }

  if (!newPassword) {
    return NextResponse.json({ error: "Укажите новый пароль" }, { status: 400 });
  }

  if (!confirmPassword) {
    return NextResponse.json({ error: "Повторите новый пароль" }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Новый пароль должен содержать не менее 8 символов" }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "Пароли не совпадают" }, { status: 400 });
  }

  if (newPassword === currentPassword) {
    return NextResponse.json({ error: "Новый пароль должен отличаться от текущего" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      id: true,
      passwordHash: true
    }
  });

  if (!user) {
    return NextResponse.json({ error: "Пользователь не найден." }, { status: 404 });
  }

  const isCurrentPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isCurrentPasswordValid) {
    return NextResponse.json({ error: "Текущий пароль указан неверно" }, { status: 400 });
  }

  const nextPasswordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: nextPasswordHash
    },
    select: {
      id: true
    }
  });

  return NextResponse.json({ success: true });
}
