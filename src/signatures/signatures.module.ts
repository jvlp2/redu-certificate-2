import { Module } from '@nestjs/common';
import { SignaturesService } from './signatures.service';
import { SignaturesController } from './signatures.controller';
import { Signature } from 'src/signatures/entities/signature.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpacesModule } from 'src/spaces/spaces.module';

@Module({
  imports: [TypeOrmModule.forFeature([Signature]), SpacesModule],
  controllers: [SignaturesController],
  providers: [SignaturesService],
})
export class SignaturesModule {}
