import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  abbr?: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  country: string;

  @IsInt()
  @Min(2020)
  @IsOptional()
  foundationYear?: number;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsInt()
  @IsNotEmpty()
  leagueId: number;
}
