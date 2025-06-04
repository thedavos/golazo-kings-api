import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ example: 'PIO FC' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'pio-fc' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  slug: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  leagueId: number;

  @ApiProperty({ example: 'Barcelona' })
  @IsString()
  @MaxLength(255)
  city: string;

  @ApiProperty({ example: 'España' })
  @IsString()
  @MaxLength(255)
  country: string;

  @ApiPropertyOptional({ example: 'PIO' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  abbr?: string;

  @ApiPropertyOptional({
    example:
      'https://kingsleague.pro/_ipx/s_200x200/kama/production/team/image/540564111.png',
  })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({
    example: 2023,
  })
  @IsInt()
  @Min(2020)
  @IsOptional()
  foundationYear?: number;

  @ApiPropertyOptional({
    example: 'Cupra Arena',
  })
  @IsString()
  @IsOptional()
  venue?: string;
}
