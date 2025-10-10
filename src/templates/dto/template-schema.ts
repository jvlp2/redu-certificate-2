import { ApiProperty } from '@nestjs/swagger';
import { CreateTemplateDto } from './create-template.dto';

export class templateSchema extends CreateTemplateDto {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  backgroundImage?: Express.Multer.File;
}
