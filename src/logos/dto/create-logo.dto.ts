import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateLogoDto {
  @IsUUID()
  @IsNotEmpty()
  templateId: string;
}
