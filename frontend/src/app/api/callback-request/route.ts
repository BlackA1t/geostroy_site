import { NextResponse } from "next/server";
import { validatePhone } from "@/lib/contact-validation";
import { prisma } from "@/lib/prisma";

function normalizeOptionalString(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const phone = String(body?.phone ?? "").trim();
  const name = normalizeOptionalString(body?.name);

  const phoneError = validatePhone(phone);
  if (phoneError) {
    return NextResponse.json({ error: phoneError }, { status: 400 });
  }

  const callbackRequest = await prisma.callbackRequest.create({
    data: {
      name,
      phone,
      status: "NEW",
      statusHistory: {
        create: {
          oldStatus: null,
          newStatus: "NEW"
        }
      }
    }
  });

  return NextResponse.json({ success: true, callbackRequestId: callbackRequest.id }, { status: 201 });
}
