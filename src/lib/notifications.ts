import { prisma } from "@/lib/prisma";
import { formatRequestTitle } from "@/lib/request-number";

export type RecentNotification = {
  id: string;
  title: string;
  displayTitle: string;
  message: string;
  readAt: Date | null;
  createdAt: Date;
  requestId: string | null;
  request: {
    requestNumber: number;
  } | null;
};

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

export async function getRecentNotifications(userId: string, limit = 5): Promise<RecentNotification[]> {
  const select = {
    id: true,
    title: true,
    message: true,
    readAt: true,
    createdAt: true,
    requestId: true,
    request: {
      select: {
        requestNumber: true
      }
    }
  };

  const unreadNotifications = await prisma.notification.findMany({
    where: {
      userId,
      readAt: null
    },
    select,
    orderBy: {
      createdAt: "desc"
    },
    take: limit
  });

  const withDisplayTitle = (notification: Omit<RecentNotification, "displayTitle">): RecentNotification => ({
    ...notification,
    displayTitle: notification.request
      ? formatRequestTitle(notification.request.requestNumber)
      : notification.title
  });

  if (unreadNotifications.length >= limit) {
    return unreadNotifications.map(withDisplayTitle);
  }

  const readNotifications = await prisma.notification.findMany({
    where: {
      userId,
      readAt: {
        not: null
      }
    },
    select,
    orderBy: {
      createdAt: "desc"
    },
    take: limit - unreadNotifications.length
  });

  return [...unreadNotifications, ...readNotifications].map(withDisplayTitle);
}

export function sortNotificationsUnreadFirst<
  T extends {
    createdAt: Date;
    readAt: Date | null;
  }
>(notifications: T[]) {
  return [...notifications].sort((first, second) => {
    if (!first.readAt && second.readAt) return -1;
    if (first.readAt && !second.readAt) return 1;
    return second.createdAt.getTime() - first.createdAt.getTime();
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
