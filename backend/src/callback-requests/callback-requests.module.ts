import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { RolesGuard } from "../common/guards/roles.guard";
import { CallbackRequestsController } from "./callback-requests.controller";
import { CallbackRequestsService } from "./callback-requests.service";

@Module({
  imports: [AuthModule],
  controllers: [CallbackRequestsController],
  providers: [CallbackRequestsService, RolesGuard],
  exports: [CallbackRequestsService]
})
export class CallbackRequestsModule {}
