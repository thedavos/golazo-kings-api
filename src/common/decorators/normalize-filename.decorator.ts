// src/common/decorators/normalize-filename.decorator.ts

import { Transform } from 'class-transformer';
import { normalizeFilename } from '@common/utils/filename-normalizer.util';

/**
 * Decorador que normaliza un nombre de archivo eliminando caracteres especiales y acentos.
 * Se puede usar en DTO para normalizar automáticamente los campos de nombre de archivo.
 */
export function NormalizeFilename() {
  return Transform(({ value }): any => {
    if (!value) return value;
    return normalizeFilename(value as string);
  });
}
