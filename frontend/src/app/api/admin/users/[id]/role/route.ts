import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isUserRole } from "@/lib/user-role";

type AdminUserRoleRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: AdminUserRoleRouteContext) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Необходима авторизация." }, { status: 401 });
  }

  if (currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Недостаточно прав." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const role = body?.role;

  if (!isUserRole(role)) {
    return NextResponse.json({ error: "Некорректная роль." }, { status: 400 });
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true
    }
  });

  if (!user) {
    return NextResponse.json({ error: "Пользователь не найден." }, { status: 404 });
  }

  if (user.role === role) {
    return NextResponse.json({ success: true, user });
  }

  if (user.id === currentUser.id && user.role === "ADMIN" && role === "USER") {
    const otherAdminsCount = await prisma.user.count({
      where: {
        role: "ADMIN",
        id: {
          not: currentUser.id
        }
      }
    });

    if (otherAdminsCount === 0) {
      return NextResponse.json(
        { error: "Нельзя снять роль администратора с последнего администратора" },
        { status: 400 }
      );
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      role: true
    }
  });

  return NextResponse.json({ success: true, user: updatedUser });
}
