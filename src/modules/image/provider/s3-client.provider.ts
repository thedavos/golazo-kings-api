import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

export const S3_CLIENT = Symbol('S3Client'); // Token de inyección

export const s3ClientProvider: Provider = {
  provide: S3_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): S3Client => {
    const accessKeyId = configService.get<string>('b2.b2KeyId');
    const secretAccessKey = configService.get<string>('b2.b2Key');
    const endpoint = configService.get<string>('b2.endpoint');
    const region = configService.get<string>('b2.region');

    if (!accessKeyId || !secretAccessKey || !endpoint || !region) {
      throw new Error('Missing Backblaze B2 configuration in .env file');
    }

    return new S3Client({
      endpoint: endpoint,
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });
  },
};
