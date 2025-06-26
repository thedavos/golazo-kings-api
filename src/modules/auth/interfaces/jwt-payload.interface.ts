import { Role } from '@modules/auth/domain/enums/role.enum';
import { Permission } from '@modules/auth/domain/enums/permission.enum';

export interface JwtPayload {
  sub: number;
  email: string;
  roles: Role[];
  permissions: Permission[];
  managedTeamId?: number;
}

export interface TokenResponse {
  accessToken: string; // Token JWT de acceso
  refreshToken: string; // Token JWT de renovación
  expiresIn: number; // Tiempo de expiración en segundos
  user: {
    // Información básica del usuario
    id: number;
    email: string;
    roles: Role[];
  };
}

export interface RefreshTokenPayload extends JwtPayload {
  tokenId: number;
}
