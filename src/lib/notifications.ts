import { prisma } from "@/lib/prisma";

type CreateNotificationInput = {
  userId: string;
  requestId?: string | null;
  title: string;
  message: string;
  type: "STATUS_CHANGED" | "REQUEST_CREATED" | "SYSTEM";
};

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      requestId: input.requestId ?? null,
      title: input.title,
      message: input.message,
      type: input.type
    }
  });
}

export async function getUnreadNotificationsCount(userId: string) {
  return prisma.notification.count({
    where: {
      userId,
      readAt: null
    }
  });
}

export async function getRecentNotifications(userId: string, limit = 5) {
  return prisma.notification.findMany({
    where: {
      userId
    },
    select: {
      id: true,
      title: true,
      message: true,
      readAt: true,
      createdAt: true,
      requestId: true
    },
    orderBy: {
      createdAt: "desc"
    },
    take: limit
  });
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
      readAt: null
    },
    data: {
      readAt: new Date()
    }
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      readAt: null
    },
    data: {
      readAt: new Date()
    }
  });
}
