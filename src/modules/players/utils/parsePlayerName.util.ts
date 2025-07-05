export interface PlayerName {
  firstName: string;
  lastName: string;
  nickname: string | null;
}

/**
 * Extrae el primer nombre, apellido y nickname de un nombre completo de jugador.
 * El nickname debe estar rodeado por comillas simples ('').
 *
 * @param fullName - El nombre completo del jugador
 * @returns Objeto con firstName, lastName y nickname (null si no tiene)
 *
 * @example
 * parsePlayerName("Iván López 'Cokita'")
 * // Returns: {firstName: "Iván", lastName: "López", nickname: "Cokita"}
 *
 * @example
 * parsePlayerName("Joel Navas")
 * // Returns: {firstName: "Joel", lastName: "Navas", nickname: null}
 */
export function parsePlayerName(fullName: string): PlayerName {
  if (!fullName) {
    throw new Error('El nombre completo debe ser una cadena de texto válida');
  }

  const trimmedName = fullName.trim();

  if (trimmedName.length === 0) {
    throw new Error('El nombre completo no puede estar vacío');
  }

  // Extraer nickname si existe (texto entre comillas simples)
  const nicknameMatch = trimmedName.match(/'([^']+)'/);
  const nickname = nicknameMatch ? nicknameMatch[1] : null;

  // Remover el nickname del nombre completo para procesar el resto
  const nameWithoutNickname = trimmedName.replace(/'[^']+'/g, '').trim();

  // Dividir el nombre restante en palabras
  const nameParts = nameWithoutNickname
    .split(/\s+/)
    .filter((part) => part.length > 0);

  if (nameParts.length === 0) {
    throw new Error('No se pudo extraer el nombre del jugador');
  }

  // El primer nombre es la primera palabra
  const firstName = nameParts[0];

  // El apellido es la última palabra (o la segunda si solo hay dos palabras)
  // Si solo hay una palabra, el apellido será una cadena vacía
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

  return {
    firstName,
    lastName,
    nickname,
  };
}
