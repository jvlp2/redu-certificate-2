import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
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

class FrontData {
  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  organization: string;

  @ApiProperty({ type: 'number' })
  @IsNumber()
  @IsNotEmpty()
  workload: number;

  @ApiProperty({ type: 'string', format: 'date-time' })
  @IsDate()
  @IsOptional()
  startDate: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  @IsDate()
  @IsOptional()
  endDate: Date;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  info: string;
}

class BackData {
  @ApiProperty({ type: 'string' })
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsOptional()
  subtitle: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsOptional()
  footer: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsOptional()
  content: string;
}

export class CreateTemplateDto {
  @ApiProperty({ type: 'string', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  blueprintId: string;

  @ApiProperty({ type: 'string', enum: structureType })
  @IsNotEmpty()
  @IsEnum(structureType)
  structureType: structureType;

  @ApiProperty({ type: 'number' })
  @IsNumber()
  @IsNotEmpty()
  structureId: number;

  @ApiProperty({ type: FrontData })
  @Type(() => FrontData)
  @TransformJson(FrontData)
  @IsNotEmpty()
  frontData: FrontData;

  @ApiProperty({ type: BackData })
  @Type(() => BackData)
  @TransformJson(BackData)
  @IsNotEmpty()
  backData: BackData;
}
