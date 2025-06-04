import { createHash } from 'crypto';
import { extname } from 'path';
import { Repository } from 'typeorm';
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from '@modules/image/domain/entities/image.entity';
import { ImageEntities } from '@modules/image/domain/value-objects/image-entities.enum';
import {
  S3StorageService,
  UploadResult,
  ImageInfo,
} from '@modules/image/services/s3-storage.service';
import { ImageDownloaderService } from '@modules/image/services/image-downloader.service';
import {
  BulkUploadResultDto,
  ImageQueryOptions,
  UploadFromUrlDto,
  UploadImageDto,
} from '@modules/image/dtos/upload-image.dto';
import { ImageStatsDto } from '@modules/image/dtos/image-stats.dto';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);

  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly s3StorageService: S3StorageService,
    private readonly imageDownloaderService: ImageDownloaderService,
  ) {}

  async uploadImage(uploadDto: UploadImageDto): Promise<Image> {
    const { file, entityType, entityId, metadata = {} } = uploadDto;

    try {
      this.validateImageFile(file);

      const uploadKey = this.generateUploadKey(
        entityType,
        entityId,
        file.originalname,
      );

      const uploadResult = await this.s3StorageService.uploadFile(
        file.buffer,
        uploadKey,
        {
          contentType: file.mimetype,
          metadata: {
            entityType: entityType.toString(),
            entityId: entityId.toString(),
            originalName: file.originalname,
            ...metadata,
          },
        },
      );

      // Guardar metadatos en base de datos
      const imageEntity = await this.createImageEntity({
        uploadResult,
        file,
        entityType,
        entityId,
      });

      this.logger.log(`Image uploaded successfully: ${uploadKey}`);
      return imageEntity;
    } catch (error) {
      this.logger.error(`Failed to upload image:`, error);
      throw error;
    }
  }

  /**
   * Sube una imagen desde una URL
   */
  async uploadImageFromUrl(uploadDto: UploadFromUrlDto): Promise<Image> {
    const {
      imageUrl,
      entityType,
      entityId,
      filename,
      metadata = {},
    } = uploadDto;

    try {
      // Validar URL y obtener información
      const imageInfo =
        await this.imageDownloaderService.getImageInfo(imageUrl);

      // Generar key único
      const uploadKey = this.generateUploadKeyFromUrl(
        entityType,
        entityId,
        imageUrl,
        filename,
      );

      // Descargar y subir imagen
      const uploadResult = await this.imageDownloaderService.downloadAndUpload(
        imageUrl,
        uploadKey,
        {
          maxSize: 50 * 1024 * 1024, // 50MB
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          metadata: {
            entityType: entityType.toString(),
            entityId: entityId.toString(),
            sourceUrl: imageUrl,
            ...metadata,
          },
        },
      );

      // Crear entidad de imagen
      const imageEntity = await this.createImageEntityFromUrl({
        uploadResult,
        entityType,
        entityId,
        imageInfo,
        filename,
        metadata,
      });

      this.logger.log(`Image uploaded from URL successfully: ${uploadKey}`);
      return imageEntity;
    } catch (error) {
      this.logger.error(`Failed to upload image from URL ${imageUrl}:`, error);
      throw error;
    }
  }

  /**
   * Sube múltiples imágenes desde archivos
   */
  async uploadMultipleImages(
    files: Express.Multer.File[],
    entityType: ImageEntities,
    entityId: number,
    metadata: Record<string, string> = {},
  ): Promise<BulkUploadResultDto> {
    const result: BulkUploadResultDto = {
      successful: [],
      failed: [],
      totalProcessed: files.length,
    };

    for (const file of files) {
      try {
        const image = await this.uploadImage({
          file,
          entityType,
          entityId,
          metadata,
        });
        result.successful.push(image);
      } catch (e) {
        const error = e as Error;
        result.failed.push({
          file,
          error: error.message,
        });
      }
    }

    this.logger.log(
      `Bulk upload completed: ${result.successful.length} successful, ${result.failed.length} failed`,
    );

    return result;
  }

  /**
   * Sube múltiples imágenes desde URLs
   */
  async uploadMultipleImagesFromUrls(
    urls: string[],
    entityType: ImageEntities,
    entityId: number,
    metadata: Record<string, string> = {},
  ): Promise<BulkUploadResultDto> {
    const result: BulkUploadResultDto = {
      successful: [],
      failed: [],
      totalProcessed: urls.length,
    };

    // Procesar en lotes de 3 para evitar sobrecargar
    const batchSize = 3;
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);

      const batchPromises = batch.map(async (url) => {
        try {
          const image = await this.uploadImageFromUrl({
            imageUrl: url,
            entityType,
            entityId,
            metadata,
          });
          return { success: true, image, url };
        } catch (e) {
          const error = e as Error;
          return { success: false, error: error.message, url };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((promiseResult) => {
        if (promiseResult.status === 'fulfilled') {
          const { success, image, url, error } = promiseResult.value;
          if (success && image) {
            result.successful.push(image);
          } else {
            result.failed.push({ url, error: error || '' });
          }
        } else {
          const reason = promiseResult.reason as Record<string, string>;
          result.failed.push({
            url: 'unknown',
            error: reason?.message || 'Unknown error',
          });
        }
      });
    }

    this.logger.log(
      `Bulk URL upload completed: ${result.successful.length} successful, ${result.failed.length} failed`,
    );

    return result;
  }

  /**
   * Obtiene imágenes con filtros
   */
  async getImages(options: ImageQueryOptions = {}): Promise<{
    images: Image[];
    total: number;
  }> {
    const {
      entityType,
      entityId,
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = options;

    const queryBuilder = this.imageRepository.createQueryBuilder('image');

    // Aplicar filtros
    if (entityType !== undefined) {
      queryBuilder.andWhere('image.entityType = :entityType', { entityType });
    }

    if (entityId !== undefined) {
      queryBuilder.andWhere('image.entityId = :entityId', { entityId });
    }

    // Aplicar ordenamiento
    queryBuilder.orderBy(`image.${sortBy}`, sortOrder);

    // Aplicar paginación
    queryBuilder.skip(offset).take(limit);

    const [images, total] = await queryBuilder.getManyAndCount();

    return { images, total };
  }

  /**
   * Obtiene una imagen por ID
   */
  async getImageById(id: number): Promise<Image> {
    const image = await this.imageRepository.findOne({ where: { id } });

    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    return image;
  }

  /**
   * Obtiene imágenes por entidad
   */
  async getImagesByEntity(
    entityType: ImageEntities,
    entityId: number,
  ): Promise<Image[]> {
    return await this.imageRepository.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtiene estadísticas de imágenes
   */
  async getImageStats(): Promise<ImageStatsDto> {
    const images = await this.imageRepository.find();

    const stats = {
      totalImages: images.length,
      totalSize: images.reduce((sum, img) => sum + (img.size || 0), 0),
      byEntityType: {} as Record<string, number>,
      byMimeType: {} as Record<string, number>,
    };

    images.forEach((image) => {
      // Contar por tipo de entidad
      const entityType = image.entityType.toString();
      stats.byEntityType[entityType] =
        (stats.byEntityType[entityType] || 0) + 1;

      // Contar por tipo MIME
      const mimeType = image.mimeType || 'unknown';
      stats.byMimeType[mimeType] = (stats.byMimeType[mimeType] || 0) + 1;
    });

    return stats;
  }

  /**
   * Descarga una imagen como Buffer
   */
  async downloadImage(id: number): Promise<{
    buffer: Buffer;
    image: Image;
  }> {
    const image = await this.getImageById(id);

    try {
      const buffer = await this.s3StorageService.downloadFile(image.key);
      return { buffer, image };
    } catch (error) {
      this.logger.error(`Failed to download image ${id}:`, error);
      throw new InternalServerErrorException('Failed to download image');
    }
  }

  async deleteImage(imageId: number): Promise<void> {
    const image = await this.imageRepository.findOneBy({ id: imageId });

    if (!image) {
      throw new NotFoundException(`Image with ID ${imageId} not found.`);
    }

    try {
      await this.deleteObjectFromS3(image.key);
    } catch (error) {
      this.logger.error(
        `Error deleting object ${image.key} from storage:`,
        error,
      );
    }

    try {
      await this.imageRepository.remove(image);
    } catch (dbError) {
      console.error('Error deleting image metadata from DB:', dbError);
      throw new InternalServerErrorException(
        'Failed to delete image metadata.',
      );
    }
  }

  /**
   * Copia una imagen
   */
  async copyImage(
    id: number,
    newEntityType: ImageEntities,
    newEntityId: number,
  ): Promise<Image> {
    const originalImage = await this.getImageById(id);

    try {
      // Generar nueva key
      const newKey = this.generateUploadKey(
        newEntityType,
        newEntityId,
        originalImage.originalFilename || 'copied-image',
      );

      // Copiar archivo en B2
      const copyResult = await this.s3StorageService.copyFile(
        originalImage.key,
        newKey,
      );

      // Crear nueva entidad
      const newImage = this.imageRepository.create({
        ...originalImage,
        key: copyResult.key,
        url: copyResult.url,
        entityType: newEntityType,
        entityId: newEntityId,
      });

      const savedImage = await this.imageRepository.save(newImage);

      this.logger.log(`Image copied: ${originalImage.key} -> ${newKey}`);
      return savedImage;
    } catch (error) {
      this.logger.error(`Failed to copy image ${id}:`, error);
      throw new InternalServerErrorException('Failed to copy image');
    }
  }

  async findImageByUuid(uuid: string): Promise<Image | null> {
    return this.imageRepository.findOneBy({ uuid });
  }

  async findImageById(id: number): Promise<Image | null> {
    return this.imageRepository.findOneBy({ id });
  }

  private async deleteObjectFromS3(key: string): Promise<void> {
    await this.s3StorageService.deleteFile(key);
  }

  private validateImageFile(file: Express.Multer.File): void {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
      );
    }

    const maxSize = 50 * 1024 * 1024; // 50MB

    if (file.size > maxSize) {
      throw new BadRequestException(
        `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`,
      );
    }
  }

  private generateUploadKey(
    entityType: ImageEntities,
    entityId: number,
    filename: string,
  ): string {
    const timestamp = Date.now();
    const hash = createHash('md5')
      .update(`${entityType}-${entityId}-${timestamp}-${filename}`)
      .digest('hex')
      .substring(0, 8);

    const extension = extname(filename) || '.jpg';
    return `${entityType}/${entityId}/${timestamp}-${hash}${extension}`;
  }

  private generateUploadKeyFromUrl(
    entityType: ImageEntities,
    entityId: number,
    imageUrl: string,
    filename?: string,
  ): string {
    const timestamp = Date.now();
    const urlHash = createHash('md5')
      .update(imageUrl)
      .digest('hex')
      .substring(0, 8);

    if (filename) {
      const extension = extname(filename) || '.png';
      return `${entityType}/${entityId}/${timestamp}-${urlHash}-${filename}${extension}`;
    }

    return `${entityType}/${entityId}/${timestamp}-${urlHash}.png`;
  }

  private async createImageEntity(params: {
    uploadResult: UploadResult;
    file: Express.Multer.File;
    entityType: ImageEntities;
    entityId: number;
  }): Promise<Image> {
    const { uploadResult, file, entityType, entityId } = params;

    const imageEntity = this.imageRepository.create({
      url: uploadResult.url,
      key: uploadResult.key,
      bucket: uploadResult.bucket,
      mimeType: file.mimetype,
      size: file.size,
      originalFilename: file.originalname,
      entityType,
      entityId,
    });

    return await this.imageRepository.save(imageEntity);
  }

  private async createImageEntityFromUrl(params: {
    uploadResult: UploadResult;
    entityType: ImageEntities;
    entityId: number;
    imageInfo: ImageInfo;
    filename?: string;
    metadata: Record<string, string>;
  }): Promise<Image> {
    const { uploadResult, entityType, entityId, imageInfo, filename } = params;

    const imageEntity = this.imageRepository.create({
      url: uploadResult.url,
      key: uploadResult.key,
      bucket: uploadResult.bucket,
      mimeType: imageInfo.contentType,
      size: imageInfo.contentLength,
      originalFilename: filename || `downloaded-${Date.now()}.jpg`,
      entityType,
      entityId,
    });

    return await this.imageRepository.save(imageEntity);
  }
}
