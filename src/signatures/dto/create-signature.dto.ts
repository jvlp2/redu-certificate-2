import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSignatureDto {
  @IsUUID()
  @IsNotEmpty()
  templateId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  role: string;
}
