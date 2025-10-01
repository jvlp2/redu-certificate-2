import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlueprintFiles } from 'src/blueprints/blueprint-files.interface';
import { CreateBlueprintDto } from 'src/blueprints/dto/create-blueprint.dto';
import { Blueprint, S3KeyKind } from 'src/blueprints/entities/blueprint.entity';
import { S3Service } from 'src/s3/s3.service';
import { Repository } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class BlueprintsService {
  constructor(
    @InjectRepository(Blueprint)
    private readonly blueprintRepository: Repository<Blueprint>,
    private readonly s3: S3Service,
  ) {}

  async create(files: BlueprintFiles, body: CreateBlueprintDto) {
    const blueprint = this.blueprintRepository.create({
      id: uuidv7(),
      ...body,
    });

    try {
      const filesArray = Object.values(files) as Express.Multer.File[];
      await Promise.all(filesArray.map((f) => this.uploadFile(blueprint, f)));
      return await this.blueprintRepository.save(blueprint);
    } catch (error) {
      await this.s3.deleteFolder(blueprint.folderKey);
      throw error;
    }
  }

  async findOne(id: string) {
    const blueprint = await this.blueprintRepository.findOne({ where: { id } });
    if (!blueprint) throw new NotFoundException('Blueprint not found');
    return blueprint;
  }

  private async uploadFile(blueprint: Blueprint, file: Express.Multer.File) {
    return this.s3.uploadFile(
      file,
      blueprint.getS3Key(file.fieldname as S3KeyKind),
    );
  }
}
