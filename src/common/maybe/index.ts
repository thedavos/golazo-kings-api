import { Option } from './maybe.common';
import { some } from './some.common';
import { none } from './none.common';

/**
 * Crea una instancia de Maybe a partir de un valor que podría ser null o undefined.
 * Si el valor es null/undefined, retorna None. Si no, retorna Some con el valor.
 * Este es el método recomendado para crear Maybes a partir de fuentes opcionales/nulables.
 * @param value El valor que podría ser nulo o indefinido.
 * @returns Maybe<T> (Some si el valor está presente, None si está ausente).
 */
const fromValue = <T>(value: T | null | undefined): Option<T> => {
  if (value === null || value === undefined) {
    return none<T>(); // Usa la función de fábrica externa 'none'
  }
  return some(value as NonNullable<T>); // Usa la función de fábrica externa 'some'
};

export { Option, some, none, fromValue };
