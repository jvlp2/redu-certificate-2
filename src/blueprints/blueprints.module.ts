import { Module } from '@nestjs/common';
import { BlueprintsService } from './blueprints.service';
import { BlueprintsController } from './blueprints.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blueprint } from './entities/blueprint.entity';
import { SpacesModule } from 'src/spaces/spaces.module';
import { AccessControlModule } from 'src/access-control/access-control.module';

@Module({
  imports: [
    AccessControlModule,
    SpacesModule,
    TypeOrmModule.forFeature([Blueprint]),
  ],
  controllers: [BlueprintsController],
  providers: [BlueprintsService],
  exports: [BlueprintsService],
})
export class BlueprintsModule {}
