import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CloneTemplateDto {
  @ApiProperty({ type: 'string', format: 'uuid', required: true })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  originalTemplateId: string;
}
