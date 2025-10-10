import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateSignatureDto } from './dto/create-signature.dto';
import { SpacesService } from 'src/spaces/spaces.service';
import { v7 as uuidv7 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Signature } from 'src/signatures/entities/signature.entity';

@Injectable()
export class SignaturesService {
  constructor(
    private readonly spacesService: SpacesService,
    @InjectRepository(Signature)
    private signatureRepository: Repository<Signature>,
  ) {}

  async create(body: CreateSignatureDto, file: Express.Multer.File) {
    const signature = this.signatureRepository.create({
      id: uuidv7(),
      ...body,
    });

    return this.spacesService
      .uploadFile(file, signature.getSpacesKey())
      .then(() => this.signatureRepository.save(signature))
      .catch(async () => {
        await this.spacesService.deleteFile(signature.getSpacesKey());
        throw new InternalServerErrorException();
      });
  }

  async remove(id: string) {
    return await this.signatureRepository.delete(id);
  }
}
