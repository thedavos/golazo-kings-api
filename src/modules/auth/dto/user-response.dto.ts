import { Role } from '@modules/auth/domain/enums/role.enum';
import { Permission } from '@modules/auth/domain/enums/permission.enum';

export class UserResponseDto {
  id: number;
  email: string;
  roles: Role[];
  permissions: Permission[];
  managedTeamId?: number;
  createdAt: Date;
  updatedAt: Date;
}
