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
} from 'class-validator';
import {
  PlayerPosition,
  PlayerPositionAbbreviation,
} from '@/modules/players/domain/value-objects/player-position.enum';

export class CreatePlayerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

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
  imageUrl?: string;

  @IsInt()
  @IsNotEmpty()
  teamId: number; // ID del equipo al que pertenece
}
