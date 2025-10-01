import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blueprint } from 'src/blueprints/entities/blueprint.entity';
import { SpacesService } from 'src/spaces/spaces.service';
import { CreateTemplateDto } from 'src/templates/dto/create-template.dto';
import { Template } from 'src/templates/entities/template.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TemplatesService {
  constructor(
    private readonly spacesService: SpacesService,
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
    @InjectRepository(Blueprint)
    private blueprintRepository: Repository<Blueprint>,
  ) {}

  private async uploadFile(base64: string) {
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    return this.spacesService.uploadBase64('templates/test.png', base64Data);
  }

  async create(body: CreateTemplateDto) {
    console.log(body);
    const sig = body.signatures[0].file;
    const base64Data = sig.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const file = {
      buffer,
      originalname: 'test.png',
      mimetype: 'image/png',
      size: buffer.length,
    } as Express.Multer.File;
    const key = await this.spacesService.uploadFile(file, 'templates/test.png');
    console.log(key);
    return body;
  }
}
