import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TransformJson } from 'src/decorators/transform-json.decorator';

class Grade {
  @ApiProperty({
    type: 'string',
    enum: ['exercise', 'gradeGroup', 'structure'],
  })
  @IsEnum(['exercise', 'gradeGroup', 'structure'])
  @IsNotEmpty()
  type: 'exercise' | 'gradeGroup' | 'structure';

  @ApiProperty({ type: 'number' })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({ type: 'number' })
  @IsNumber()
  @IsNotEmpty()
  value: number;
}

class Requirements {
  @ApiProperty({ type: 'string', format: 'date-time' })
  @IsDate()
  @IsOptional()
  afterDate?: Date;

  @ApiProperty({ type: 'number' })
  @IsNumber()
  @IsOptional()
  presence?: number;

  @ApiProperty({ type: 'number' })
  @IsNumber()
  @IsOptional()
  progress?: number;

  @ApiProperty({ type: Grade })
  @Type(() => Grade)
  @TransformJson(Grade)
  @IsNotEmpty()
  grade: Grade;
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
  // @ApiProperty({ type: 'string', format: 'uuid' })
  // @IsUUID()
  // @IsNotEmpty()
  // blueprintId: string;

  // @ApiProperty({ type: 'string', enum: structureType })
  // @IsNotEmpty()
  // @IsEnum(structureType)
  // structureType: structureType;

  // @ApiProperty({ type: 'number' })
  // @IsNumber()
  // @IsNotEmpty()
  // structureId: number;

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

  @ApiProperty({ type: Requirements })
  @Type(() => Requirements)
  @TransformJson(Requirements)
  @IsNotEmpty()
  requirements: Requirements;
}
