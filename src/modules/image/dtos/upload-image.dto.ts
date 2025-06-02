import { Image } from '@modules/image/domain/entities/image.entity';
import { ImageEntities } from '@modules/image/domain/value-objects/image-entities.enum';

export class UploadImageDto {
  /**
   * Archivo de imagen a subir
   * @example "image.jpg"
   */
  file: Express.Multer.File;

  /**
   * Tipo de entidad asociada
   * @example "LEAGUE"
   */
  entityType: ImageEntities;

  /**
   * ID de la entidad asociada
   * @example 123
   */
  entityId: number;

  /**
   * Metadatos adicionales (opcional)
   * @example { "category": "profile", "description": "Avatar del usuario" }
   */
  metadata?: Record<string, string>;
}

export class UploadFromUrlDto {
  /**
   * Url de la imagen
   */
  imageUrl: string;

  /**
   * Nombre de la imagen
   */
  filename?: string;

  /**
   * Tipo de entidad asociada
   * @example "LEAGUE"
   */
  entityType: ImageEntities;

  /**
   * ID de la entidad asociada
   * @example 123
   */
  entityId: number;

  /**
   * Metadatos adicionales (opcional)
   * @example { "category": "profile", "description": "Avatar del usuario" }
   */
  metadata?: Record<string, string>;
}

export class BulkUploadResultDto {
  successful: Image[];
  failed: Array<{
    file?: Express.Multer.File;
    url?: string;
    error: string;
  }>;
  totalProcessed: number;
}

export interface ImageQueryOptions {
  entityType?: ImageEntities;
  entityId?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'size';
  sortOrder?: 'ASC' | 'DESC';
}
