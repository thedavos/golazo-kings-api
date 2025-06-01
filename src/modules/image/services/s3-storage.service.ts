import {
  Injectable,
  Inject,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  PutObjectCommandInput,
  HeadObjectCommand,
  HeadObjectCommandOutput,
  GetObjectCommand,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { S3_CLIENT } from '@modules/image/provider/s3-client.provider';

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
}

export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  cacheControl?: string;
  contentDisposition?: string;
}

@Injectable()
export class S3StorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly bucketName: string;
  private readonly publicUrlBase: string;

  constructor(
    @Inject(S3_CLIENT) private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.getOrThrow<string>('b2.bucket');
    this.publicUrlBase = this.configService.getOrThrow<string>('b2.publicUrl');
  }

  /**
   * Sube un archivo a S3/B2
   */
  async uploadFile(
    buffer: Buffer,
    key: string,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    const uploadParams: PutObjectCommandInput = {
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: options.contentType || 'application/octet-stream',
      CacheControl: options.cacheControl || 'max-age=31536000', // 1 año por defecto
      ContentDisposition: options.contentDisposition,
      Metadata: {
        uploadedAt: new Date().toISOString(),
        ...options.metadata,
      },
    };

    try {
      this.logger.debug(`Uploading file with key: ${key}`);
      await this.s3Client.send(new PutObjectCommand(uploadParams));

      const url = this.buildPublicUrl(key);

      this.logger.log(`File uploaded successfully: ${key}`);
      return {
        key,
        url,
        bucket: this.bucketName,
      };
    } catch (e) {
      const error = e as S3ServiceException;
      this.handleS3Error(error, 'upload file', key);
    }
  }

  /**
   * Elimina un archivo de S3/B2
   */
  async deleteFile(key: string): Promise<void> {
    const deleteParams = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      this.logger.debug(`Deleting file with key: ${key}`);
      await this.s3Client.send(new DeleteObjectCommand(deleteParams));
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (e) {
      const error = e as S3ServiceException;
      this.handleS3Error(error, 'delete file', key);
    }
  }

  /**
   * Verifica si un archivo existe en S3/B2
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
      return true;
    } catch (e) {
      const error = e as Error & HeadObjectCommandOutput;
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return false;
      }
      this.logger.error(`Error checking if file exists ${key}:`, error);
      throw new InternalServerErrorException(
        `Failed to check file existence: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene metadatos de un archivo
   */
  async getFileMetadata(key: string): Promise<{
    contentType: string;
    contentLength: number;
    lastModified: Date;
    metadata: Record<string, string>;
  }> {
    try {
      const response = await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );

      return {
        contentType: response.ContentType || 'application/octet-stream',
        contentLength: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
        metadata: response.Metadata || {},
      };
    } catch (e) {
      const error = e as Error;
      this.logger.error(`Failed to get metadata for file ${key}:`, error);
      throw new InternalServerErrorException(
        `Failed to get file metadata: ${error.message}`,
      );
    }
  }

  /**
   * Descarga un archivo de S3/B2
   */
  async downloadFile(key: string): Promise<Buffer> {
    try {
      const body = await this.getObject(key);
      const byteArray = await body.transformToByteArray();
      return Buffer.from(byteArray);
    } catch (e) {
      const error = e as S3ServiceException;
      this.handleS3Error(error, 'download file', key);
    }
  }

  /**
   * Copia un archivo dentro del mismo bucket
   */
  async copyFile(
    sourceKey: string,
    destinationKey: string,
  ): Promise<UploadResult> {
    try {
      const { CopyObjectCommand } = await import('@aws-sdk/client-s3');

      await this.s3Client.send(
        new CopyObjectCommand({
          Bucket: this.bucketName,
          CopySource: `${this.bucketName}/${sourceKey}`,
          Key: destinationKey,
        }),
      );

      const url = this.buildPublicUrl(destinationKey);

      this.logger.log(`File copied from ${sourceKey} to ${destinationKey}`);
      return {
        key: destinationKey,
        url,
        bucket: this.bucketName,
      };
    } catch (e) {
      const error = e as S3ServiceException;
      this.handleS3Error(
        error,
        'copy file',
        `${sourceKey} to ${destinationKey}`,
      );
    }
  }

  /**
   * Lista archivos con un prefijo específico
   */
  async listFiles(
    prefix: string = '',
    maxKeys: number = 1000,
  ): Promise<{
    files: Array<{
      key: string;
      size: number;
      lastModified: Date;
      url: string;
    }>;
    isTruncated: boolean;
  }> {
    try {
      const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');

      const response = await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.bucketName,
          Prefix: prefix,
          MaxKeys: maxKeys,
        }),
      );

      const files = (response.Contents || []).map((object) => ({
        key: object.Key!,
        size: object.Size || 0,
        lastModified: object.LastModified || new Date(),
        url: this.buildPublicUrl(object.Key!),
      }));

      return {
        files,
        isTruncated: response.IsTruncated || false,
      };
    } catch (e) {
      const error = e as Error;
      this.logger.error(`Failed to list files with prefix ${prefix}:`, error);
      throw new InternalServerErrorException(
        `Failed to list files: ${error.message}`,
      );
    }
  }

  /**
   * Construye la URL pública del archivo
   */
  buildPublicUrl(key: string): string {
    return `${this.publicUrlBase}/${this.bucketName}/${key}`;
  }

  /**
   * Obtiene información del bucket
   */
  getBucketInfo(): { name: string; publicUrlBase: string } {
    return {
      name: this.bucketName,
      publicUrlBase: this.publicUrlBase,
    };
  }

  /**
   * Valida que la configuración del servicio sea correcta
   */
  async validateConfiguration(): Promise<boolean> {
    try {
      // Intenta listar objetos para verificar conectividad
      const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
      await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.bucketName,
          MaxKeys: 1,
        }),
      );

      this.logger.log('S3 configuration validated successfully');
      return true;
    } catch (error) {
      this.logger.error('S3 configuration validation failed:', error);
      return false;
    }
  }

  private async getObject(key: string) {
    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );

    if (!response.Body) {
      throw new InternalServerErrorException(
        'Empty response body from storage',
      );
    }

    return response.Body;
  }

  /**
   * Maneja errores de S3 de forma consistente
   */
  private handleS3Error(
    error: S3ServiceException,
    operation: string,
    key?: string,
  ): never {
    const context = key ? `${operation} for key ${key}` : operation;
    this.logger.error(`Failed to ${context}:`, error);

    // Mapear errores específicos de S3 a excepciones de NestJS
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      throw new NotFoundException(
        key ? `File not found: ${key}` : 'Resource not found',
      );
    }

    if (
      error.name === 'AccessDenied' ||
      error.$metadata?.httpStatusCode === 403
    ) {
      throw new ForbiddenException('Access denied to storage resource');
    }

    if (error.name === 'NoSuchBucket') {
      throw new InternalServerErrorException('Storage bucket not found');
    }

    // Error genérico
    throw new InternalServerErrorException(
      `Failed to ${operation}: ${error.message}`,
    );
  }
}
