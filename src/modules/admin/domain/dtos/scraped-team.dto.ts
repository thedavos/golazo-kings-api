import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import slugify from '@common/utils/slugify.utils';

/**
 * DTO para representar la información de un equipo scrapeado de la web como una clase,
 * con documentación para Swagger.
 */
export class ScrapedTeamDto {
  /**
   * Nombre del equipo extraído. Puede ser null si no se encuentra.
   */
  @ApiPropertyOptional({
    description: 'Nombre del equipo scrapeado.',
    example: 'Porcinos FC',
    type: String,
    nullable: false,
  })
  @IsString()
  name: string;

  /**
   * URL completa del logo del equipo. Puede ser null si no se encuentra.
   */
  @ApiPropertyOptional({
    description: 'URL del logo del equipo scrapeado.',
    example: 'https://kingsleague.pro/logos/porcinosfc.png',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  logo: string | null;

  /**
   * Slug del equipo extraído.
   */
  @ApiPropertyOptional({
    description: 'Slug del equipo scrapeado.',
    example: 'porcinos-fc',
    type: String,
    nullable: false,
  })
  @IsString()
  slug: string;

  @ApiPropertyOptional({
    description: 'Identificador de la liga al que pertenece el equipo',
    example: 1,
    type: Number,
    nullable: false,
  })
  @IsInt()
  leagueId: number;

  @ApiPropertyOptional({
    description:
      'Identificador de referencia al que pertenece el equipo de la web',
    example: 11,
    type: Number,
    nullable: true,
  })
  @IsInt()
  @IsOptional()
  referenceId: number;

  @ApiPropertyOptional({
    description: 'URL de referencia al que pertenece el equipo de la web',
    example: '11-aniquiladores-fc',
    type: String,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  referenceUrl: string;

  /**
   * Constructor para crear una instancia de ScrapedTeamDto.
   * @param name - El nombre del equipo.
   * @param leagueId - El identificador de la liga
   * @param logo - La URL del logo del equipo.
   * @param referenceId - Id de referencia a la web
   * @param referenceUrl - Url de referencia de la web
   */
  constructor(
    name: string,
    leagueId: number,
    logo: string | null,
    referenceId: number | null = null,
    referenceUrl: string | null = null,
  ) {
    this.name = name;
    this.leagueId = leagueId;
    this.logo = logo;
    this.slug = slugify(name);

    if (referenceId) {
      this.referenceId = referenceId;
    }

    if (referenceUrl) {
      this.referenceUrl = referenceUrl;
    }
  }
}
