import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const RECENT_NOTIFICATIONS_LIMIT = 5;

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      include: {
        request: {
          select: {
            requestNumber: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return {
      notifications: this.sortUnreadFirst(notifications)
    };
  }

  async getRecentNotifications(userId: string) {
    const include = {
      request: {
        select: {
          requestNumber: true
        }
      }
    };

    const unreadNotifications = await this.prisma.notification.findMany({
      where: {
        userId,
        readAt: null
      },
      include,
      orderBy: {
        createdAt: "desc"
      },
      take: RECENT_NOTIFICATIONS_LIMIT
    });

    if (unreadNotifications.length >= RECENT_NOTIFICATIONS_LIMIT) {
      return { notifications: unreadNotifications };
    }

    const readNotifications = await this.prisma.notification.findMany({
      where: {
        userId,
        readAt: {
          not: null
        }
      },
      include,
      orderBy: {
        createdAt: "desc"
      },
      take: RECENT_NOTIFICATIONS_LIMIT - unreadNotifications.length
    });

    return {
      notifications: [...unreadNotifications, ...readNotifications]
    };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        readAt: null
      }
    });

    return { count };
  }

  async markRead(userId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId
      },
      include: {
        request: {
          select: {
            requestNumber: true
          }
        }
      }
    });

    if (!notification) {
      throw new NotFoundException("Уведомление не найдено.");
    }

    if (notification.readAt) {
      return { notification };
    }

    const updatedNotification = await this.prisma.notification.update({
      where: { id },
      data: {
        readAt: new Date()
      },
      include: {
        request: {
          select: {
            requestNumber: true
          }
        }
      }
    });

    return { notification: updatedNotification };
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        readAt: null
      },
      data: {
        readAt: new Date()
      }
    });

    return {
      success: true,
      count: result.count
    };
  }

  private sortUnreadFirst<T extends { createdAt: Date; readAt: Date | null }>(notifications: T[]) {
    return [...notifications].sort((first, second) => {
      if (!first.readAt && second.readAt) return -1;
      if (first.readAt && !second.readAt) return 1;
      return second.createdAt.getTime() - first.createdAt.getTime();
    });
  }
}
