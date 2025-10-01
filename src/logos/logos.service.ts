import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLogoDto } from './dto/create-logo.dto';
import { S3Service } from 'src/s3/s3.service';
import { v7 as uuidv7 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logo } from 'src/logos/entities/logo.entity';

@Injectable()
export class LogosService {
  constructor(
    @InjectRepository(Logo)
    private readonly logoRepository: Repository<Logo>,
    private readonly s3: S3Service,
  ) {}

  async create(body: CreateLogoDto, file: Express.Multer.File) {
    await this.checkCount(body.templateId);
    const logo = this.logoRepository.create({
      id: uuidv7(),
      ...body,
    });

    try {
      await this.s3.uploadFile(file, logo.getSpacesKey());
      return await this.logoRepository.save(logo);
    } catch (error) {
      await this.s3.deleteFile(logo.getSpacesKey());
      throw error;
    }
  }

  async remove(id: string) {
    return await this.logoRepository.delete(id);
  }

  private async checkCount(templateId: string) {
    const count = await this.logoRepository.count({ where: { templateId } });
    if (count < 3) return;

    throw new BadRequestException('Template must have at most 3 logos');
  }
}
