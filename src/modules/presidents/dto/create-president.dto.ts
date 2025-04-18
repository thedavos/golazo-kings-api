import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsDateString,
  IsOptional,
  MaxLength,
  IsBoolean,
  IsUrl,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePresidentDto {
  @ApiProperty({ description: 'Nombre del presidente', example: 'Samantha' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ description: 'Apellido del presidente', example: 'Rivera' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ description: 'Mote del presidente', example: 'Rivers' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nickName: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento (YYYY-MM-DD)',
    example: '1947-03-08',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ description: 'Nacionalidad', example: 'Española' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nationality?: string;

  @ApiProperty({
    description: 'Fecha de inicio del mandato (YYYY-MM-DD)',
    example: '2009-06-01',
  })
  @IsDateString()
  @IsNotEmpty()
  termStartDate: Date;

  @ApiPropertyOptional({
    description: 'Fecha de fin del mandato (YYYY-MM-DD), null si sigue activo',
    example: null,
  })
  @IsOptional()
  @IsDateString()
  termEndDate?: Date | null;

  @ApiPropertyOptional({
    description: 'Indica si es un presidente activo actualmente en el equipo',
    default: true, // Podrías establecer un default si lo deseas
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true; // Default a true podría tener sentido

  @ApiPropertyOptional({
    description: 'URL de la imagen del presidente',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(512)
  imageUrl?: string;

  @ApiProperty({
    description: 'ID del equipo al que pertenece el presidente',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  teamId: number;
}
