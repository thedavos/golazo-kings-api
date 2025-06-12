import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class SlugValidationPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value !== 'string') {
      throw new BadRequestException('El slug debe ser una cadena de texto.');
    }

    // Expression regular para validar slugs:
    // ^[a-z0-9]+(?:-[a-z0-9]+)*$
    // - ^: Inicio de la cadena.
    // - [a-z0-9]+: Uno o más caracteres alfanuméricos en minúscula.
    // - (?:-[a-z0-9]+)*: Cero o más grupos de un guion seguido de uno o más caracteres alfanuméricos.
    // - $: Fin de la cadena.
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

    if (!slugRegex.test(value)) {
      throw new BadRequestException('El formato del slug no es válido.');
    }

    return value;
  }
}
