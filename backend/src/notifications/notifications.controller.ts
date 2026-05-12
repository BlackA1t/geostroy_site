import { Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { AccessTokenPayload } from "../auth/token.service";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotifications(@CurrentUser() user: AccessTokenPayload) {
    return this.notificationsService.getNotifications(user.sub);
  }

  @Get("recent")
  getRecentNotifications(@CurrentUser() user: AccessTokenPayload) {
    return this.notificationsService.getRecentNotifications(user.sub);
  }

  @Get("unread-count")
  getUnreadCount(@CurrentUser() user: AccessTokenPayload) {
    return this.notificationsService.getUnreadCount(user.sub);
  }

  @Patch("read-all")
  markAllRead(@CurrentUser() user: AccessTokenPayload) {
    return this.notificationsService.markAllRead(user.sub);
  }

  @Patch(":id/read")
  markRead(@CurrentUser() user: AccessTokenPayload, @Param("id") id: string) {
    return this.notificationsService.markRead(user.sub, id);
  }
}
