import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateCallbackRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsString()
  @MaxLength(50)
  phone: string;
}
