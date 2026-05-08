import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSession, setSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Некорректные данные формы." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ error: "Введите email и пароль." }, { status: 400 });
  }

  const userWithPassword = await prisma.user.findUnique({
    where: { email }
  });

  if (!userWithPassword) {
    return NextResponse.json({ error: "Неверный email или пароль." }, { status: 401 });
  }

  const isValidPassword = await verifyPassword(password, userWithPassword.passwordHash);

  if (!isValidPassword) {
    return NextResponse.json({ error: "Неверный email или пароль." }, { status: 401 });
  }

  const session = await createSession(userWithPassword.id);
  await setSessionCookie(session.token);

  const { passwordHash: _passwordHash, ...user } = userWithPassword;

  return NextResponse.json({ user });
}
