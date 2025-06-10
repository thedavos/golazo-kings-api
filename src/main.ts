import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService, ConfigType } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import appConfigType from '@config/app.config';
import swaggerConfigType from '@config/swagger.config';
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
      bodyLimit: 50 * 1024 * 1024,
    }),
  );
  const configService = app.get(ConfigService);

  const appConfig = configService.get<ConfigType<typeof appConfigType>>('app');
  const swaggerConfig =
    configService.get<ConfigType<typeof swaggerConfigType>>('swagger');

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

  await app.register(fastifyCors, {
    origin: appConfig?.cors.origin,
    methods: appConfig?.cors.methods,
    credentials: appConfig?.cors.credentials,
  });

  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
  });

  if (swaggerConfig?.enabled) {
    const config = new DocumentBuilder()
      .setTitle(swaggerConfig.title)
      .setDescription(swaggerConfig.description)
      .setVersion(swaggerConfig.version)
      .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerConfig.path, app, documentFactory);
  }

  await app.listen(appConfig?.port as number, '0.0.0.0');
}

void bootstrap();
