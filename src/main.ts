import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ValidationPipe,
  VersioningType,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import type { SwaggerConfig } from '@config/swagger.config';
import type { AppConfig } from '@config/app.config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
      bodyLimit: 50 * 1024 * 1024,
    }),
  );
  const configService = app.get(ConfigService);

  const appConfig = configService.get<AppConfig>('app') as AppConfig;

  const swaggerConfig = configService.get<SwaggerConfig>(
    'swagger',
  ) as SwaggerConfig;

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'https:'],
        scriptSrc: [`'self'`],
        ...(process.env.NODE_ENV === 'development'
          ? {
              scriptSrc: [`'self'`, `'unsafe-inline'`, `'unsafe-eval'`],
              styleSrc: [`'self'`, `'unsafe-inline'`],
            }
          : {}),
      },
    },
  });

  app.setGlobalPrefix(appConfig.apiPrefix);

  app.enableVersioning({
    type: VersioningType.HEADER,
    header: 'X-API-Version',
    defaultVersion: VERSION_NEUTRAL,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.register(fastifyCors, {
    origin: appConfig.cors.origin,
    methods: appConfig.cors.methods,
    credentials: appConfig.cors.credentials,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-API-Version',
      'CF-Access-Client-Id',
      'CF-Access-Client-Secret',
    ],
  });

  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
  });

  if (swaggerConfig.enabled) {
    const config = new DocumentBuilder()
      .setTitle(swaggerConfig.title)
      .addGlobalParameters({
        in: 'header',
        name: 'X-API-Version',
        required: true,
        schema: {
          example: '1',
        },
      })
      .setDescription(swaggerConfig.description)
      .setVersion(swaggerConfig.version)
      .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerConfig.path, app, documentFactory);
  }

  await app.listen(appConfig.port, appConfig.host);
}

void bootstrap();
