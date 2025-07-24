import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEnum,
  IsDateString,
  MaxLength,
  Min,
  Max,
  IsUrl,
  MinLength,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import {
  PlayerPosition,
  PlayerPositionAbbreviation,
} from '@/modules/players/domain/value-objects/player-position.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlayerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: 'mar-serracanta' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  slug: string;

  @IsEnum(PlayerPosition)
  @IsOptional()
  position?: PlayerPosition;

  @IsEnum(PlayerPositionAbbreviation)
  @IsOptional()
  positionAbbreviation?: PlayerPositionAbbreviation;

  @IsInt()
  @Min(0)
  @Max(99) // O el máximo que consideres
  @IsOptional()
  jerseyNumber?: number;

  @IsDateString() // Valida que sea una fecha en formato ISO 8601
  @IsOptional()
  dateOfBirth?: string; // Recibir como string, TypeORM lo convertirá

  @IsString()
  @MaxLength(100)
  @IsOptional()
  nationality?: string;

  @IsUrl()
  @IsOptional()
  profileImageUrl?: string;

  @IsInt()
  @IsNotEmpty()
  teamId: number;

  @ApiProperty({ example: '32e73122-6496-4730-8979-81aef240fe35' })
  @IsUUID()
  @IsNotEmpty()
  teamUuid: string;

  @ApiPropertyOptional({
    example: 350,
  })
  @IsInt()
  @IsOptional()
  referenceId: number;

  @ApiPropertyOptional({
    example: '350-antonela-romoleroux',
  })
  @IsString()
  @IsOptional()
  referenceUrl: string;

  @ApiPropertyOptional({
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isQueensLeaguePlayer: boolean;
}
