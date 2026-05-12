import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateCallbackRequestDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}
