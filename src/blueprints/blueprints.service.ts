import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlueprintFiles } from 'src/blueprints/blueprint-files.interface';
import { CreateBlueprintDto } from 'src/blueprints/dto/create-blueprint.dto';
import { Blueprint } from 'src/blueprints/entities/blueprint.entity';
import { SpacesService } from 'src/spaces/spaces.service';
import { Repository } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class BlueprintsService {
  constructor(
    private readonly spacesService: SpacesService,
    @InjectRepository(Blueprint)
    private blueprintRepository: Repository<Blueprint>,
  ) {}

  private getFolderKey(id: string) {
    return `blueprints/${id}`;
  }

  private getFileKey(id: string, file: string) {
    return `${this.getFolderKey(id)}/${file}`;
  }

  private async uploadFile(file: Express.Multer.File, id: string) {
    return this.spacesService.uploadFile(
      file,
      this.getFileKey(id, `file.fieldname`),
    );
  }

  async create(files: BlueprintFiles, body: CreateBlueprintDto) {
    const id = uuidv7();
    const filesArray = Object.values(files) as Express.Multer.File[];

    try {
      await Promise.all(filesArray.map((file) => this.uploadFile(file, id)));
      const blueprint = this.blueprintRepository.create({
        id,
        ...body,
      });
      return await this.blueprintRepository.save(blueprint);
    } catch (error) {
      await this.spacesService.deleteFiles(
        filesArray.map((file) => this.getFileKey(id, file.originalname)),
      );
      throw error;
    }
  }
}
