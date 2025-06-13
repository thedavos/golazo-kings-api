// noinspection NonAsciiCharacters

/**
 * Normaliza un nombre de archivo reemplazando caracteres especiales y acentos por sus equivalentes ASCII
 * y eliminando caracteres no permitidos en nombres de archivo.
 *
 * @param filename Nombre del archivo a normalizar
 * @returns Nombre del archivo normalizado
 */
export function normalizeFilename(filename: string): string {
  if (!filename) return '';

  // Separamos el nombre del archivo de su extensión
  const lastDotIndex = filename.lastIndexOf('.');
  const name = lastDotIndex !== -1 ? filename.slice(0, lastDotIndex) : filename;
  const extension = lastDotIndex !== -1 ? filename.slice(lastDotIndex) : '';

  // Mapa de caracteres especiales a sus equivalentes ASCII
  const charMap: { [key: string]: string } = {
    á: 'a',
    à: 'a',
    ã: 'a',
    â: 'a',
    ä: 'a',
    é: 'e',
    è: 'e',
    ê: 'e',
    ë: 'e',
    í: 'i',
    ì: 'i',
    î: 'i',
    ï: 'i',
    ó: 'o',
    ò: 'o',
    õ: 'o',
    ô: 'o',
    ö: 'o',
    ú: 'u',
    ù: 'u',
    û: 'u',
    ü: 'u',
    ý: 'y',
    ÿ: 'y',
    ñ: 'n',
    ç: 'c',
    Á: 'A',
    À: 'A',
    Ã: 'A',
    Â: 'A',
    Ä: 'A',
    É: 'E',
    È: 'E',
    Ê: 'E',
    Ë: 'E',
    Í: 'I',
    Ì: 'I',
    Î: 'I',
    Ï: 'I',
    Ó: 'O',
    Ò: 'O',
    Õ: 'O',
    Ô: 'O',
    Ö: 'O',
    Ú: 'U',
    Ù: 'U',
    Û: 'U',
    Ü: 'U',
    Ý: 'Y',
    Ñ: 'N',
    Ç: 'C',
  };

  // Normalizar el nombre del archivo
  const normalizedName = name
    // Reemplazar caracteres especiales según el mapa
    .split('')
    .map((char) => charMap[char] || char)
    .join('')
    // Eliminar caracteres no alfanuméricos (excepto guiones y guiones bajos)
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    // Reemplazar múltiples guiones consecutivos por uno solo
    .replace(/-+/g, '-')
    // Eliminar guiones al inicio y final
    .replace(/^-+|-+$/g, '')
    // Convertir a minúsculas
    .toLowerCase();

  return normalizedName + extension.toLowerCase();
}
