import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { GuestRequestsController } from "./guest-requests.controller";
import { GuestRequestsService } from "./guest-requests.service";

@Module({
  imports: [AuthModule],
  controllers: [GuestRequestsController],
  providers: [GuestRequestsService],
  exports: [GuestRequestsService]
})
export class GuestRequestsModule {}
