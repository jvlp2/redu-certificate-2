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

  // eslint-disable-next-line @typescript-eslint/require-await
  async create(body: CreateTemplateDto, files: Express.Multer.File[]) {
    console.log(body);
    console.log(files);
    return body;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async update(
    id: string,
    body: CreateTemplateDto,
    files: Express.Multer.File[],
  ) {
    console.log(body);
    console.log(files);
    return body;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async delete(id: string) {
    console.log(id);
    return id;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async get(id: string) {
    console.log(id);
    return id;
  }
}
