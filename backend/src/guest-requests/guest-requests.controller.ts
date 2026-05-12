import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
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
import { GUEST_REQUEST_COOKIE_NAME, GUEST_REQUEST_MAX_AGE_SECONDS } from "../common/utils/guest-claim-token";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { AccessTokenPayload } from "../auth/token.service";
import { ClaimGuestRequestDto } from "./dto/claim-guest-request.dto";
import { CreateGuestRequestDto } from "./dto/create-guest-request.dto";
import { GuestRequestsService } from "./guest-requests.service";

type CookieResponse = {
  cookie: (name: string, value: string, options: Record<string, unknown>) => void;
  clearCookie: (name: string, options: Record<string, unknown>) => void;
};

type CookieRequest = {
  cookies?: Record<string, string | undefined>;
};

function getGuestCookieOptions(configService: ConfigService, maxAge?: number) {
  const cookieDomain = configService.get<string>("COOKIE_DOMAIN")?.trim();
  const secure = configService.get<string>("COOKIE_SECURE") === "true";

  return {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    ...(cookieDomain ? { domain: cookieDomain } : {}),
    ...(maxAge !== undefined ? { maxAge: maxAge * 1000 } : {})
  };
}

@Controller()
export class GuestRequestsController {
  constructor(
    private readonly guestRequestsService: GuestRequestsService,
    private readonly configService: ConfigService
  ) {}

  @Post(["guest-requests", "contact-request"])
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
  async createGuestRequest(
    @Body() dto: CreateGuestRequestDto,
    @UploadedFiles() files: UploadedRequestFile[] = [],
    @Res({ passthrough: true }) response: CookieResponse
  ) {
    const result = await this.guestRequestsService.createGuestRequest(dto, files);

    response.cookie(
      GUEST_REQUEST_COOKIE_NAME,
      result.claimToken,
      getGuestCookieOptions(this.configService, GUEST_REQUEST_MAX_AGE_SECONDS)
    );

    return result.response;
  }

  @Get("guest-requests/pending")
  @UseGuards(JwtAuthGuard)
  getPendingGuestRequest(@Req() request: CookieRequest) {
    return this.guestRequestsService.getPendingGuestRequest(request.cookies?.[GUEST_REQUEST_COOKIE_NAME]);
  }

  @Post("guest-requests/claim")
  @UseGuards(JwtAuthGuard)
  async claimGuestRequest(
    @CurrentUser() user: AccessTokenPayload,
    @Req() request: CookieRequest,
    @Body() dto: ClaimGuestRequestDto,
    @Res({ passthrough: true }) response: CookieResponse
  ) {
    const result = await this.guestRequestsService.claimGuestRequest(user.sub, dto.token ?? request.cookies?.[GUEST_REQUEST_COOKIE_NAME]);

    response.clearCookie(GUEST_REQUEST_COOKIE_NAME, getGuestCookieOptions(this.configService));

    return result;
  }
}
