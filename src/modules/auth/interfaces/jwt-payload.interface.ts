import { Role } from '@modules/auth/domain/enums/role.enum';
import { Permission } from '@modules/auth/domain/enums/permission.enum';

export interface JwtPayload {
  sub: number;
  email: string;
  roles: Role[];
  permissions: Permission[];
  managedTeamId?: number;
}

export interface RefreshTokenPayload extends JwtPayload {
  tokenId: number;
}
