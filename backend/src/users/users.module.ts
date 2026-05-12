import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  imports: [ConfigModule, JwtModule.register({})],
  controllers: [UsersController],
  providers: [UsersService, JwtAuthGuard],
  exports: [UsersService]
})
export class UsersModule {}
