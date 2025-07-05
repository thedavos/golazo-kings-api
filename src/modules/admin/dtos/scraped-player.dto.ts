import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsUrl,
} from 'class-validator';

/**
 * DTO para representar datos de jugadores extraídos mediante web scraping
 *
 * Este DTO se utiliza para transportar información básica de jugadores
 * obtenida desde fuentes externas (sitios web, APIs, etc.) antes de
 * ser procesada y almacenada en la base de datos.
 */
export class ScrapedPlayerDto {
  @ApiProperty({
    description: 'Nombre completo del jugador tal como aparece en la fuente',
    example: 'Sergio Agüero',
    maxLength: 200,
    type: String,
  })
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(200, { message: 'El nombre no puede exceder los 200 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Primer nombre del jugador tal como aparece en la fuente',
    example: 'Sergio Agüero',
    maxLength: 200,
    type: String,
  })
  @IsString({ message: 'El primer nombre debe ser un texto válido' })
  @IsNotEmpty({ message: 'El primer nombre es obligatorio' })
  @MaxLength(200, {
    message: 'El primer nombre no puede exceder los 200 caracteres',
  })
  firstName: string;

  @ApiProperty({
    description: 'Apellido del jugador tal como aparece en la fuente',
    example: 'Agüero',
    maxLength: 200,
    type: String,
  })
  @IsString({ message: 'El apellido debe ser un texto válido' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MaxLength(200, {
    message: 'El apellido no puede exceder los 200 caracteres',
  })
  lastName: string;

  @ApiProperty({
    description:
      'Nombre por el que es conocido popularmente el jugador. Para streamers/influencers suele ser su handle o nombre de usuario.',
    example: 'Kun Agüero',
    maxLength: 100,
    type: String,
    required: false,
  })
  @IsString({ message: 'El apodo debe ser un texto válido' })
  @IsOptional()
  @MaxLength(100, { message: 'El apodo no puede exceder los 100 caracteres' })
  nickname: string;

  @ApiProperty({
    description:
      'Posición táctica del jugador. Puede venir en diferentes formatos según la fuente (completo, abreviado, etc.)',
    example: 'Delantero',
    enum: [
      'Portero',
      'Defensa',
      'Mediocampista',
      'Delantero',
      'GK',
      'DEF',
      'MID',
      'FWD',
    ],
    maxLength: 50,
    type: String,
    required: false,
  })
  @IsString({ message: 'La posición debe ser un texto válido' })
  @IsOptional()
  @MaxLength(50, { message: 'La posición no puede exceder los 50 caracteres' })
  position: string;

  @ApiProperty({
    description:
      'Número de dorsal asignado al jugador. Se mantiene como string porque puede venir en diferentes formatos desde la fuente.',
    example: '10',
    pattern: '^[0-9]{1,2}$',
    maxLength: 3,
    type: String,
    required: false,
  })
  @IsString({ message: 'El número de camiseta debe ser un texto válido' })
  @IsOptional()
  @MaxLength(3, {
    message: 'El número de camiseta no puede exceder los 3 caracteres',
  })
  jerseyNumber: string;

  @ApiProperty({
    description:
      'Determina si el jugador pertenece a la categoría WildCard (streamers, influencers, invitados especiales, jugadores de primera división) o si es un jugador del draft regular.',
    example: true,
    type: Boolean,
    default: false,
  })
  @IsBoolean({ message: 'isWildCard debe ser un valor booleano (true/false)' })
  @IsNotEmpty({ message: 'El campo isWildCard es obligatorio' })
  isWildCard: boolean;

  @ApiProperty({
    description: 'URL de la imagen del jugador',
    example:
      'https://kingsleague-cdn.kama.football/account/production/seasonTeamPlayer/image/977236174.png',
    type: String,
    required: false,
  })
  @IsUrl()
  @IsOptional()
  imageUrl: string;
}
