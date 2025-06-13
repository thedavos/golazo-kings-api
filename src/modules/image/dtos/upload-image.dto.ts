import { MultipartFile } from '@fastify/multipart';
import {
  IsString,
  IsOptional,
  IsUrl,
  IsInt,
  IsEnum,
  IsNumber,
  Min,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Image } from '@modules/image/domain/entities/image.entity';
import { ImageEntities } from '@modules/image/domain/value-objects/image-entities.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NormalizeFilename } from '@common/decorators/normalize-filename.decorator';

export class UploadImageDto {
  file: MultipartFile;

  @IsEnum(ImageEntities)
  entityType: ImageEntities;

  @IsInt()
  entityId: number;

  /**
   * Metadatos adicionales (opcional)
   * @example { "category": "profile", "description": "Avatar del usuario" }
   */
  @IsOptional()
  metadata?: Record<string, string>;
}

export class UploadFromUrlDto {
  @ApiProperty({
    description: 'URL de la imagen a descargar',
    example: 'https://example.com/image.jpg',
    format: 'uri',
  })
  @IsUrl({}, { message: 'imageUrl debe ser una URL válida' })
  imageUrl: string;

  @ApiPropertyOptional({
    description: 'Nombre personalizado para el archivo (opcional)',
    example: 'team-image',
  })
  @IsOptional()
  @NormalizeFilename()
  @IsString({ message: 'filename debe ser una cadena de texto' })
  filename?: string;

  @ApiProperty({
    description: 'Tipo de entidad asociada',
    enum: ImageEntities,
    example: ImageEntities.TEAM,
  })
  @IsEnum(ImageEntities, { message: 'entityType debe ser un valor válido' })
  entityType: ImageEntities;

  @ApiProperty({
    description: 'ID de la entidad asociada',
    example: 456,
    minimum: 1,
  })
  @IsNumber({}, { message: 'entityId debe ser un número' })
  @Min(1, { message: 'entityId debe ser mayor a 0' })
  @Type(() => Number)
  entityId: number;

  @ApiPropertyOptional({
    description: 'Metadatos adicionales (opcional)',
    example: { category: 'team', alt: 'Imagen principal de la entidad' },
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  @IsOptional()
  @IsObject({ message: 'metadata debe ser un objeto' })
  metadata?: Record<string, string>;
}

export class BulkUploadResultDto {
  successful: Image[];
  failed: Array<{
    file?: MultipartFile;
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
