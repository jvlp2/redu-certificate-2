import { Module } from '@nestjs/common';
import { BlueprintsService } from './blueprints.service';
import { BlueprintsController } from './blueprints.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blueprint } from './entities/blueprint.entity';
import { SpacesModule } from 'src/spaces/spaces.module';

@Module({
  imports: [TypeOrmModule.forFeature([Blueprint]), SpacesModule],
  controllers: [BlueprintsController],
  providers: [BlueprintsService],
})
export class BlueprintsModule {}
