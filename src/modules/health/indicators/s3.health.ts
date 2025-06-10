import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorService,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { S3StorageService } from '@modules/image/services/s3-storage.service';

@Injectable()
export class S3HealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly s3Service: S3StorageService,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);
    const s3Result = await this.s3Service.checkConnection();

    return s3Result
      .map(() => indicator.up() as HealthIndicatorResult)
      .unwrapOrElse(() => indicator.down());
  }
}
