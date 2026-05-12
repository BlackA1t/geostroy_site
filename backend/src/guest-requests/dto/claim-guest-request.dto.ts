import { IsOptional, IsString } from "class-validator";

export class ClaimGuestRequestDto {
  @IsOptional()
  @IsString()
  token?: string;
}
