import { ApiProperty } from '@nestjs/swagger';
import { TokenResponse } from '@modules/auth/interfaces/jwt-payload.interface';
import { Role } from '@modules/auth/domain/enums/role.enum';
import { UserResponseDto } from '@modules/auth/dto/user-response.dto';

export class TokenResponseDto implements TokenResponse {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: number;

  @ApiProperty({ type: UserResponseDto })
  user: {
    id: number;
    email: string;
    roles: Role[];
  };
}
