import { Module } from '@nestjs/common';
import { TemplatesModule } from './templates/templates.module';
import { SpacesModule } from './spaces/spaces.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import { BlueprintsModule } from './blueprints/blueprints.module';
import { CertificatesModule } from './certificates/certificates.module';
import { SignaturesModule } from './signatures/signatures.module';
import { LogosModule } from './logos/logos.module';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      synchronize: true,
      entities: [path.join(__dirname, '**', '*.entity.{ts,js}')],
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'pt',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [new HeaderResolver(['x-lang'])],
      typesOutputPath: path.join(
        __dirname,
        '../src/generated/i18n.generated.ts',
      ),
    }),
    TemplatesModule,
    SpacesModule,
    BlueprintsModule,
    CertificatesModule,
    SignaturesModule,
    LogosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
