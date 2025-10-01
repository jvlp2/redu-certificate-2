import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateCertificateDto {
  @ApiProperty({ type: 'string' })
  @IsOptional()
  blueprintId: string;
}
