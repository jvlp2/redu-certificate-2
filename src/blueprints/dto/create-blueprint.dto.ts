import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBlueprintDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
