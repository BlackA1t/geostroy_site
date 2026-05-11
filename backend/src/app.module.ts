import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import path from "path";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { CallbackRequestsModule } from "./callback-requests/callback-requests.module";
import { envValidation } from "./config/env.validation";
import { FilesModule } from "./files/files.module";
import { GuestRequestsModule } from "./guest-requests/guest-requests.module";
import { HealthController } from "./health.controller";
import { NotificationsModule } from "./notifications/notifications.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RequestsModule } from "./requests/requests.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [path.resolve(process.cwd(), "backend", ".env"), path.resolve(process.cwd(), ".env")],
      validate: envValidation
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100
      }
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    RequestsModule,
    GuestRequestsModule,
    CallbackRequestsModule,
    NotificationsModule,
    AdminModule,
    FilesModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
