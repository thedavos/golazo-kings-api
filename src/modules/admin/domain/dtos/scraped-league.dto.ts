import { IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para representar la información de una liga de la web como una clase,
 * con documentación para Swagger.
 */
export class ScrapedLeagueDto {
  @ApiPropertyOptional({
    description: 'Identificador de la liga',
    example: 1,
    type: Number,
    nullable: false,
  })
  @IsInt()
  leagueId: number;

  /**
   * Constructor para crear una instancia de ScrapedLeagueDto.
   * @param leagueId - El identificador de la liga
   */
  constructor(leagueId: number) {
    this.leagueId = leagueId;
  }
}
