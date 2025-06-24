import { Role } from '@modules/auth/domain/enums/role.enum';

export class AuthResponseDto {
  access_token: string;
  user: {
    id: number;
    email: string;
    roles: Role[];
  };
}
