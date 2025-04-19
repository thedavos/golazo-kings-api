import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Image } from './domain/entities/image.entity';
import { ImageService } from './image.service';
import { s3ClientProvider } from './provider/s3-client.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Image]), ConfigModule],
  providers: [ImageService, s3ClientProvider],
  exports: [ImageService],
})
export class ImageModule {}
