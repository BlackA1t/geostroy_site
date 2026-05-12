import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { AccessTokenPayload } from "../auth/token.service";
import { CallbackRequestsService } from "./callback-requests.service";
import { CreateCallbackRequestDto } from "./dto/create-callback-request.dto";
import { UpdateCallbackRequestDto } from "./dto/update-callback-request.dto";

@Controller()
export class CallbackRequestsController {
  constructor(private readonly callbackRequestsService: CallbackRequestsService) {}

  @Post(["callback-requests", "callback-request"])
  createCallbackRequest(@Body() dto: CreateCallbackRequestDto) {
    return this.callbackRequestsService.createCallbackRequest(dto);
  }

  @Get("admin/callback-requests")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getAdminCallbackRequests(@Query("q") q?: string, @Query("status") status?: string) {
    return this.callbackRequestsService.getAdminCallbackRequests({ q, status });
  }

  @Get("admin/callback-requests/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getAdminCallbackRequest(@Param("id") id: string) {
    return this.callbackRequestsService.getAdminCallbackRequest(id);
  }

  @Patch("admin/callback-requests/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateAdminCallbackRequest(
    @CurrentUser() user: AccessTokenPayload,
    @Param("id") id: string,
    @Body() dto: UpdateCallbackRequestDto
  ) {
    return this.callbackRequestsService.updateAdminCallbackRequest(user.sub, id, dto);
  }
}
