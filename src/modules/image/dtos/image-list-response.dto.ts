import { Image } from '@modules/image/domain/entities/image.entity';

export class ImageListResponseDto {
  /**
   * Lista de imágenes
   */
  images: Image[];

  /**
   * Total de imágenes que coinciden con los filtros
   * @example 150
   */
  total: number;
}
