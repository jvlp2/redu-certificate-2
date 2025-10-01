import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateLogoDto {
  @ApiProperty({ type: 'string', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  templateId: string;
}
