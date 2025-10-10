import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TransformJson } from 'src/decorators/transform-json.decorator';

enum structureType {
  COURSE = 'course',
  ENVIRONMENT = 'environment',
  SPACE = 'space',
}

class SignatureData {
  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  role: string;
}

class FrontData {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  organization: string;

  @IsNumber()
  @IsNotEmpty()
  workload: number;

  @IsDate()
  @IsOptional()
  startDate: Date;

  @IsDate()
  @IsOptional()
  endDate: Date;

  @IsString()
  @IsNotEmpty()
  info: string;

  @Type(() => SignatureData)
  @TransformJson(SignatureData)
  @IsArray()
  @IsNotEmpty()
  signatureData: SignatureData[];
}

class BackData {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  subtitle: string;

  @IsString()
  @IsOptional()
  footer: string;

  @IsString()
  @IsOptional()
  content: string;
}

export class CreateTemplateDto {
  @IsUUID()
  @IsNotEmpty()
  blueprintId: string;

  @IsNotEmpty()
  @IsEnum(structureType)
  structureType: structureType;

  @IsString()
  @IsNumberString()
  structureId: string;

  @Type(() => FrontData)
  @TransformJson(FrontData)
  @IsArray()
  @IsNotEmpty()
  frontData: FrontData;

  @Type(() => BackData)
  @TransformJson(BackData)
  @IsArray()
  @IsNotEmpty()
  backData: BackData;
}
