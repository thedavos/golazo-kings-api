import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsPositive,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  IsBoolean,
} from 'class-validator';

export class ScrapedPlayerBodyDto {
  @ApiProperty({
    description: 'ID de la región donde se encuentra la liga',
    example: 1,
    minimum: 1,
    maximum: 100,
    type: 'integer',
  })
  @IsInt({ message: 'La región debe ser un número entero' })
  @IsPositive({ message: 'La región debe ser un número positivo' })
  @Min(1, { message: 'La región debe ser mayor a 0' })
  @Max(100, { message: 'La región no puede ser mayor a 100' })
  @IsOptional()
  region: number;

  @ApiProperty({
    description: 'Temporada de la liga (año)',
    example: 1,
    minimum: 1,
    maximum: 100,
    type: 'integer',
  })
  @IsInt({ message: 'La temporada debe ser un número entero' })
  @Min(1, {
    message: 'El id referencial de la temporada debe ser mayor o igual a 1',
  })
  @Max(100, {
    message: 'El id referencial de la temporada no puede ser mayor a 100',
  })
  @IsOptional()
  season: number;

  @ApiProperty({
    description: 'División o split de la temporada',
    example: 1,
    minimum: 1,
    maximum: 100,
    type: 'integer',
  })
  @IsInt({ message: 'El split debe ser un número entero' })
  @IsPositive({ message: 'El split debe ser un número positivo' })
  @Min(1, { message: 'El split debe ser mayor a 0' })
  @Max(100, { message: 'El split no puede ser mayor a 100' })
  @IsOptional()
  split: number;

  @ApiProperty({
    description: 'ID de referencia del equipo en la fuente externa',
    example: 123,
    minimum: 1,
    type: 'integer',
  })
  @IsInt({
    message: 'El ID del equipo de referencia debe ser un número entero',
  })
  @IsPositive({
    message: 'El ID del equipo de referencia debe ser un número positivo',
  })
  referenceTeamId: number;

  @ApiProperty({
    description: 'URL de referencia del equipo en la fuente externa',
    example: 'https://kingsleague.pro/es/equipos/10-pio-fc',
    format: 'uri',
    maxLength: 500,
  })
  @IsString({ message: 'La URL de referencia debe ser una cadena de texto' })
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
    },
    {
      message:
        'La URL de referencia debe ser una URL válida con protocolo HTTP o HTTPS',
    },
  )
  referenceTeamUrl: string;

  @ApiProperty({
    description: 'Flag que indica si es una liga de la KL o QL',
    example: false,
    type: 'boolean',
    default: false,
  })
  @IsBoolean({ message: 'Flag que indica si es una liga de la KL o QL' })
  @IsOptional()
  isQueensLeague: boolean;
}
