import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateLogoDto } from './dto/create-logo.dto';
import { SpacesService } from 'src/spaces/spaces.service';
import { v7 as uuidv7 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logo } from 'src/logos/entities/logo.entity';

@Injectable()
export class LogosService {
  constructor(
    private readonly spacesService: SpacesService,
    @InjectRepository(Logo)
    private logoRepository: Repository<Logo>,
  ) {}

  async create(body: CreateLogoDto, file: Express.Multer.File) {
    const logo = this.logoRepository.create({
      id: uuidv7(),
      ...body,
    });

    return this.spacesService
      .uploadFile(file, logo.getSpacesKey())
      .then(() => this.logoRepository.save(logo))
      .catch(async () => {
        await this.spacesService.deleteFile(logo.getSpacesKey());
        throw new InternalServerErrorException();
      });
  }

  async remove(id: string) {
    return await this.logoRepository.delete(id);
  }
}
