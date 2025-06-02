export class ImageStatsDto {
  /**
   * Número total de imágenes
   * @example 1250
   */
  totalImages: number;

  /**
   * Tamaño total en bytes
   * @example 524288000
   */
  totalSize: number;

  /**
   * Distribución por tipo de entidad
   * @example { "USER": 450, "PRODUCT": 800 }
   */
  byEntityType: Record<string, number>;

  /**
   * Distribución por tipo MIME
   * @example { "image/jpeg": 900, "image/png": 350 }
   */
  byMimeType: Record<string, number>;
}
