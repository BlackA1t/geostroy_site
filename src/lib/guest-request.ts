import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { createRequestStatusHistory } from "./status-history";

export const GUEST_REQUEST_COOKIE_NAME = "geostroy_guest_request";
export const GUEST_REQUEST_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function generateGuestRequestToken() {
  return randomBytes(32).toString("base64url");
}

export function hashGuestRequestToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function setGuestRequestCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(GUEST_REQUEST_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: GUEST_REQUEST_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production"
  });
}

export async function clearGuestRequestCookie() {
  const cookieStore = await cookies();

  cookieStore.set(GUEST_REQUEST_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production"
  });
}

export async function claimGuestRequestsForUser(userId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(GUEST_REQUEST_COOKIE_NAME)?.value;

  if (!token) return null;

  const claimTokenHash = hashGuestRequestToken(token);

  const guestRequest = await prisma.guestRequest.findFirst({
    where: {
      claimTokenHash,
      claimedAt: null
    },
    include: {
      files: true,
      statusHistory: {
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });

  if (!guestRequest) {
    await clearGuestRequestCookie();
    return null;
  }

  const createdRequest = await prisma.$transaction(async (tx) => {
    const request = await tx.request.create({
      data: {
        userId,
        name: guestRequest.name,
        phone: guestRequest.phone,
        email: guestRequest.email,
        serviceType: guestRequest.serviceType,
        material: guestRequest.material,
        quantity: guestRequest.quantity,
        description: guestRequest.description,
        status: guestRequest.status,
        files: {
          create: guestRequest.files.map((file) => ({
            fileName: file.fileName,
            fileUrl: file.fileUrl,
            fileType: file.fileType,
            originalName: file.originalName,
            sizeBytes: file.sizeBytes
          }))
        }
      }
    });

    await tx.guestRequest.update({
      where: {
        id: guestRequest.id
      },
      data: {
        claimedById: userId,
        convertedRequestId: request.id,
        claimedAt: new Date()
      }
    });

    for (const historyItem of guestRequest.statusHistory) {
      await createRequestStatusHistory(
        {
          requestId: request.id,
          oldStatus: historyItem.oldStatus,
          newStatus: historyItem.newStatus,
          comment: historyItem.comment,
          changedById: historyItem.changedById,
          actorType: historyItem.actorType as "ADMIN" | "USER" | "SYSTEM",
          createdAt: historyItem.createdAt
        },
        tx
      );
    }

    return request;
  });

  await clearGuestRequestCookie();

  return createdRequest;
}
