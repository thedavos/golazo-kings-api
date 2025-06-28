import { ApiProperty } from '@nestjs/swagger';
import { User } from '@modules/auth/domain/entities/user.entity';

export class TokenResponseDto {
  @ApiProperty({
    description: 'Token de acceso JWT para autenticar las peticiones',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Token de actualización para renovar el token de acceso',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Tiempo de expiración del token de acceso en segundos',
    example: 3600,
  })
  expiresIn: number;

  @ApiProperty({
    type: User,
    description: 'Información del usuario autenticado',
  })
  user: User;
}
