import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateRequestDto {
  @IsString()
  @MaxLength(200)
  serviceType: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  material?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  quantity?: string;

  @IsString()
  @MaxLength(5000)
  description: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  @MaxLength(50)
  phone: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  email?: string;
}
