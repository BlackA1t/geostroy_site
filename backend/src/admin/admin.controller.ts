import { Body, Controller, Delete, Get, Param, Patch, Query, Res, StreamableFile, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { createReadStream } from "fs";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { AccessTokenPayload } from "../auth/token.service";
import { AdminService } from "./admin.service";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("overview")
  getOverview() {
    return this.adminService.getOverview();
  }

  @Get("users")
  getUsers(@Query("q") q?: string) {
    return this.adminService.getUsers({ q });
  }

  @Get("users/:id")
  getUser(@Param("id") id: string) {
    return this.adminService.getUser(id);
  }

  @Patch("users/:id/role")
  updateUserRole(
    @CurrentUser() admin: AccessTokenPayload,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.adminService.updateUserRole(admin.sub, id, body);
  }

  @Get("requests")
  getRequests(@Query("q") q?: string, @Query("status") status?: string) {
    return this.adminService.getRequests({ q, status });
  }

  @Get("requests/:id")
  getRequest(@Param("id") id: string) {
    return this.adminService.getRequest(id);
  }

  @Patch("requests/:id")
  updateRequestStatus(
    @CurrentUser() admin: AccessTokenPayload,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.adminService.updateRequestStatus(admin.sub, id, body);
  }

  @Patch("requests/:id/details")
  updateRequestDetails(
    @CurrentUser() admin: AccessTokenPayload,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.adminService.updateRequestDetails(admin.sub, id, body);
  }

  @Delete("requests/:id/files/:fileId")
  deleteRequestFile(
    @CurrentUser() admin: AccessTokenPayload,
    @Param("id") id: string,
    @Param("fileId") fileId: string
  ) {
    return this.adminService.deleteRequestFile(admin.sub, id, fileId);
  }

  @Get("requests/:id/files/:fileId/download")
  async downloadRequestFile(
    @Param("id") id: string,
    @Param("fileId") fileId: string,
    @Res({ passthrough: true }) response: any
  ) {
    const file = await this.adminService.getRequestFileForDownload(id, fileId);
    response.set({
      "Content-Type": file.fileType ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.originalName || file.fileName)}`
    });

    return new StreamableFile(createReadStream(file.absolutePath));
  }

  @Get("guest-requests")
  getGuestRequests(@Query("q") q?: string, @Query("status") status?: string) {
    return this.adminService.getGuestRequests({ q, status });
  }

  @Get("guest-requests/:id")
  getGuestRequest(@Param("id") id: string) {
    return this.adminService.getGuestRequest(id);
  }

  @Patch("guest-requests/:id")
  updateGuestRequestStatus(
    @CurrentUser() admin: AccessTokenPayload,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.adminService.updateGuestRequestStatus(admin.sub, id, body);
  }

  @Patch("guest-requests/:id/details")
  updateGuestRequestDetails(
    @CurrentUser() admin: AccessTokenPayload,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.adminService.updateGuestRequestDetails(admin.sub, id, body);
  }

  @Delete("guest-requests/:id/files/:fileId")
  deleteGuestRequestFile(
    @CurrentUser() admin: AccessTokenPayload,
    @Param("id") id: string,
    @Param("fileId") fileId: string
  ) {
    return this.adminService.deleteGuestRequestFile(admin.sub, id, fileId);
  }

  @Get("guest-requests/:id/files/:fileId/download")
  async downloadGuestRequestFile(
    @Param("id") id: string,
    @Param("fileId") fileId: string,
    @Res({ passthrough: true }) response: any
  ) {
    const file = await this.adminService.getGuestRequestFileForDownload(id, fileId);
    response.set({
      "Content-Type": file.fileType ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.originalName || file.fileName)}`
    });

    return new StreamableFile(createReadStream(file.absolutePath));
  }
}
