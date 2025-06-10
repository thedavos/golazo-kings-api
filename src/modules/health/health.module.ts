import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { S3HealthIndicator } from './indicators/s3.health';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { ImageModule } from '@modules/image/image.module';

@Module({
  imports: [TerminusModule, HttpModule, DatabaseModule, ImageModule],
  controllers: [HealthController],
  providers: [S3HealthIndicator],
})
export class HealthModule {}
