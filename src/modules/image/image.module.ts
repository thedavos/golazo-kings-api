import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { Image } from './domain/entities/image.entity';
import { ImageService } from './services/image.service';
import { s3ClientProvider } from './provider/s3-client.provider';
import { S3StorageService } from './services/s3-storage.service';
import { ImageDownloaderService } from './services/image-downloader.service';
import { ImageController } from './image.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Image]),
    ConfigModule,
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  providers: [
    ImageService,
    s3ClientProvider,
    S3StorageService,
    ImageDownloaderService,
  ],
  controllers: [ImageController],
  exports: [ImageService, S3StorageService, ImageDownloaderService],
})
export class ImageModule {}
