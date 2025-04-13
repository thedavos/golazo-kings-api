import {
  IsString,
  IsOptional,
  IsUrl,
  IsBoolean,
  Min,
  Max,
  Length,
  IsInt,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLeagueDto {
  @ApiProperty({ example: 'Kings League Spain' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'kings-league-spain' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  slug: string;

  @ApiProperty({ example: 'KL Spain' })
  @IsString()
  @Length(2, 10)
  abbr: string;

  @ApiProperty({ example: 'España' })
  @IsString()
  country: string;

  @ApiProperty({ example: 'Barcelona' })
  @IsString()
  city: string;

  @ApiProperty({ required: false, example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiProperty({ required: false, example: 2022 })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  foundationYear?: number;

  @ApiProperty({ required: false, example: 'https://kingsleague.pro' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ required: false, example: 'kingsleague' })
  @IsOptional()
  @IsString()
  twitterHandle?: string;

  @ApiProperty({ required: false, example: 'kingsleague' })
  @IsOptional()
  @IsString()
  instagramHandle?: string;

  @ApiProperty({ example: 12 })
  @IsInt()
  @Min(2)
  @Max(12)
  numberOfTeams: number;

  @ApiProperty({
    example: 'Liga profesional de fútbol 7 presidida por Gerard Piqué',
  })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ required: false, example: 'https://example.com/rules' })
  @IsOptional()
  @IsString()
  @IsUrl()
  rules?: string;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}
