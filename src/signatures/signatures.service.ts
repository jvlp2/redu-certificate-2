import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateSignatureDto } from './dto/create-signature.dto';
import { S3Service } from 'src/s3/s3.service';
import { v7 as uuidv7 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Signature } from 'src/signatures/entities/signature.entity';

@Injectable()
export class SignaturesService {
  constructor(
    @InjectRepository(Signature)
    private readonly signatureRepository: Repository<Signature>,
    private readonly s3: S3Service,
  ) {}

  async create(body: CreateSignatureDto, file: Express.Multer.File) {
    await this.checkCount(body.templateId);
    const signature = this.signatureRepository.create({
      id: uuidv7(),
      ...body,
    });

    return this.s3
      .uploadFile(file, signature.getSpacesKey())
      .then(() => this.signatureRepository.save(signature))
      .catch(async () => {
        await this.s3.deleteFile(signature.getSpacesKey());
        throw new InternalServerErrorException();
      });
  }

  async remove(id: string) {
    return await this.signatureRepository.delete(id);
  }

  private async checkCount(templateId: string) {
    const count = await this.signatureRepository.count({
      where: { templateId },
    });
    if (count < 3) return;

    throw new BadRequestException('Template must have at most 3 signatures');
  }
}
