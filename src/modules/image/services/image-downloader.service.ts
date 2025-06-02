import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponseHeaders, AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import {
  S3StorageService,
  UploadResult,
  UploadOptions,
  ImageInfo,
} from './s3-storage.service';

export interface DownloadImageOptions extends UploadOptions {
  maxSize?: number; // en bytes
  allowedTypes?: string[];
  timeout?: number;
}

@Injectable()
export class ImageDownloaderService {
  private readonly logger = new Logger(ImageDownloaderService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly s3StorageService: S3StorageService,
  ) {}

  /**
   * Descarga una imagen desde una URL y la sube a B2
   */
  async downloadAndUpload(
    imageUrl: string,
    destinationKey: string,
    options: DownloadImageOptions = {},
  ): Promise<UploadResult> {
    // Validar URL
    this.validateUrl(imageUrl);

    try {
      this.logger.debug(`Downloading image from: ${imageUrl}`);

      const response = await firstValueFrom(
        this.httpService.get<ArrayBufferLike>(imageUrl, {
          responseType: 'arraybuffer',
          timeout: options.timeout || 30000,
          maxContentLength: options.maxSize || 50 * 1024 * 1024, // 50 MB por defecto
        }),
      );

      const headers = response.headers as AxiosResponseHeaders;

      const buffer = Buffer.from(response.data);
      const contentType: string =
        (headers.get('Content-Type') as string) || 'image/jpeg';

      // Validaciones
      this.validateImageResponse(contentType, buffer.length, options);

      // Subir a B2
      const uploadResult = await this.s3StorageService.uploadFile(
        buffer,
        destinationKey,
        {
          contentType,
          metadata: {
            sourceUrl: imageUrl,
            downloadedAt: new Date().toISOString(),
            originalSize: buffer.length.toString(),
            ...options.metadata,
          },
          cacheControl: options.cacheControl,
          contentDisposition: options.contentDisposition,
        },
      );

      this.logger.log(
        `Successfully downloaded and uploaded image: ${imageUrl} -> ${destinationKey}`,
      );
      return uploadResult;
    } catch (e) {
      const error = e as AxiosError;
      this.handleDownloadError(error, imageUrl);
    }
  }

  /**
   * Descarga múltiples imágenes en paralelo
   */
  async downloadAndUploadMultiple(
    downloads: Array<{
      url: string;
      key: string;
      options?: DownloadImageOptions;
    }>,
    concurrency: number = 3,
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    // Procesar en lotes para controlar la concurrencia
    for (let i = 0; i < downloads.length; i += concurrency) {
      const batch = downloads.slice(i, i + concurrency);

      const batchPromises = batch.map(({ url, key, options }) =>
        this.downloadAndUpload(url, key, options),
      );

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          this.logger.error(
            `Failed to download ${batch[index].url}:`,
            result.reason,
          );
        }
      });
    }

    return results;
  }

  /**
   * Obtiene información de una imagen sin descargarla completamente
   */
  async getImageInfo(imageUrl: string): Promise<ImageInfo> {
    try {
      const response = await firstValueFrom(
        this.httpService.head(imageUrl, { timeout: 10000 }),
      );

      const headers = response.headers as AxiosResponseHeaders;

      const contentType = (headers.get('content-type') as string) || '';
      const contentLength = parseInt(
        (headers.get('content-length') as string) || '0',
      );

      return {
        contentType,
        contentLength,
        isValid: contentType.startsWith('image/'),
      };
    } catch (e) {
      const error = e as AxiosError;
      throw new BadRequestException(
        `Unable to get image info: ${error.message}`,
      );
    }
  }

  private validateUrl(url: string): void {
    try {
      new URL(url);
    } catch {
      throw new BadRequestException('Invalid URL format');
    }

    // Opcional: validar dominios permitidos
    const allowedDomains = ['example.com', 'images.unsplash.com']; // Configurar según necesites
    if (allowedDomains.length > 0) {
      const urlObj = new URL(url);
      if (!allowedDomains.some((domain) => urlObj.hostname.includes(domain))) {
        throw new BadRequestException('Domain not allowed');
      }
    }
  }

  private validateImageResponse(
    contentType: string,
    contentLength: number,
    options: DownloadImageOptions,
  ): void {
    // Validar tipo de contenido
    const allowedTypes = options.allowedTypes || [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    if (!allowedTypes.includes(contentType)) {
      throw new BadRequestException(`Invalid content type: ${contentType}`);
    }

    // Validar tamaño
    const maxSize = options.maxSize || 50 * 1024 * 1024; // 50MB
    if (contentLength > maxSize) {
      throw new BadRequestException(`Image too large: ${contentLength} bytes`);
    }
  }

  private handleDownloadError(error: AxiosError, imageUrl: string): never {
    this.logger.error(`Failed to download image from ${imageUrl}:`, error);

    const status = error.response?.status as number;

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new BadRequestException(`Unable to reach image URL: ${imageUrl}`);
    }

    if (status === 404) {
      throw new NotFoundException(`Image not found at URL: ${imageUrl}`);
    }

    if (status >= 400 && status < 500) {
      throw new BadRequestException(`Invalid image URL: ${imageUrl}`);
    }

    throw new InternalServerErrorException(
      `Failed to download image: ${error.message}`,
    );
  }
}
