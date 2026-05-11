import { NextResponse } from "next/server";
import { clearSessionCookie, deleteCurrentSession } from "@/lib/session";

export async function POST() {
  await deleteCurrentSession();
  await clearSessionCookie();

  return NextResponse.json({ ok: true });
}
