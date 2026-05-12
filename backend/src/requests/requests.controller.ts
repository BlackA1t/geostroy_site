import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { createReadStream } from "fs";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import {
  ensureRequestTempUploadsDirSync,
  makeStoredRequestFileName,
  MAX_REQUEST_FILE_SIZE_BYTES,
  MAX_REQUEST_FILES_PER_UPLOAD,
  requestFileFilter,
  type UploadedRequestFile
} from "../common/utils/request-files";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { AccessTokenPayload } from "../auth/token.service";
import { CreateRequestDto } from "./dto/create-request.dto";
import { UpdateRequestDto } from "./dto/update-request.dto";
import { RequestsService } from "./requests.service";

@Controller("requests")
@UseGuards(JwtAuthGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get()
  getMyRequests(
    @CurrentUser() user: AccessTokenPayload,
    @Query("q") q?: string,
    @Query("status") status?: string
  ) {
    return this.requestsService.getMyRequests(user.sub, { q, status });
  }

  @Post()
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: (_request, _file, callback) => {
          callback(null, ensureRequestTempUploadsDirSync());
        },
        filename: (_request, file, callback) => {
          callback(null, makeStoredRequestFileName(file.originalname ?? "file"));
        }
      }) as never,
      limits: {
        fileSize: MAX_REQUEST_FILE_SIZE_BYTES,
        files: MAX_REQUEST_FILES_PER_UPLOAD
      },
      fileFilter: requestFileFilter
    })
  )
  createRequest(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateRequestDto,
    @UploadedFiles() files: UploadedRequestFile[] = []
  ) {
    return this.requestsService.createRequest(user.sub, dto, files);
  }

  @Get(":id")
  getMyRequest(@CurrentUser() user: AccessTokenPayload, @Param("id") id: string) {
    return this.requestsService.getMyRequest(user.sub, id);
  }

  @Patch(":id")
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: (_request, _file, callback) => {
          callback(null, ensureRequestTempUploadsDirSync());
        },
        filename: (_request, file, callback) => {
          callback(null, makeStoredRequestFileName(file.originalname ?? "file"));
        }
      }) as never,
      limits: {
        fileSize: MAX_REQUEST_FILE_SIZE_BYTES,
        files: MAX_REQUEST_FILES_PER_UPLOAD
      },
      fileFilter: requestFileFilter
    })
  )
  updateRequest(
    @CurrentUser() user: AccessTokenPayload,
    @Param("id") id: string,
    @Body() dto: UpdateRequestDto,
    @UploadedFiles() files: UploadedRequestFile[] = []
  ) {
    return this.requestsService.updateRequest(user.sub, id, dto, files);
  }

  @Delete(":id/files/:fileId")
  deleteRequestFile(
    @CurrentUser() user: AccessTokenPayload,
    @Param("id") id: string,
    @Param("fileId") fileId: string
  ) {
    return this.requestsService.deleteRequestFile(user.sub, id, fileId);
  }

  @Get(":id/files/:fileId/download")
  async downloadRequestFile(
    @CurrentUser() user: AccessTokenPayload,
    @Param("id") id: string,
    @Param("fileId") fileId: string,
    @Res({ passthrough: true }) response: any
  ) {
    const file = await this.requestsService.getRequestFileForDownload(user.sub, id, fileId);
    response.set({
      "Content-Type": file.fileType ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.originalName || file.fileName)}`
    });

    return new StreamableFile(createReadStream(file.absolutePath));
  }
}
