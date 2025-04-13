import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService, ConfigType } from '@nestjs/config';
import appConfigType from '@config/app.config';
import swaggerConfigType from '@config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = new ConfigService();

  const appConfig = configService.get<ConfigType<typeof appConfigType>>('app');
  const swaggerConfig =
    configService.get<ConfigType<typeof swaggerConfigType>>('swagger');

  app.setGlobalPrefix(appConfig?.apiPrefix as string);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: appConfig?.defaultApiVersion,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: appConfig?.cors.origin,
    methods: appConfig?.cors.methods,
    credentials: appConfig?.cors.credentials,
  });

  if (swaggerConfig?.enabled) {
    const config = new DocumentBuilder()
      .setTitle(swaggerConfig.title)
      .setDescription(swaggerConfig.description)
      .setVersion(swaggerConfig.version)
      .addBearerAuth()
      .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerConfig.path, app, documentFactory);
  }

  await app.listen(appConfig?.port as number);
}

void bootstrap();
