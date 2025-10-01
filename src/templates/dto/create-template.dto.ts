import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsString,
  ValidateNested,
  IsNotEmpty,
  IsBase64,
} from 'class-validator';

class SignatureDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  @IsBase64()
  file: string;
}

export class CreateTemplateDto {
  @ApiProperty({ type: [SignatureDto] })
  @Type(() => SignatureDto)
  @ValidateNested({ each: true })
  @IsArray()
  @IsNotEmpty()
  signatures: SignatureDto[];
}
