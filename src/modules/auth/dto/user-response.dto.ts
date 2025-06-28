import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@modules/auth/domain/enums/role.enum';
import { Permission } from '@modules/auth/domain/enums/permission.enum';
import { User } from '@modules/auth/domain/entities/user.entity';

export class UserResponseDto {
  @ApiProperty({
    description: 'Información completa del usuario',
    type: () => User,
    example: {
      id: 1,
      email: 'usuario@ejemplo.com',
      name: 'Juan Pérez',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
    },
  })
  user: User;

  @ApiProperty({
    description: 'Roles asignados al usuario',
    enum: Role,
    isArray: true,
    example: [Role.SUPER_ADMIN, Role.VIEWER],
    type: [String],
  })
  roles: Role[];

  @ApiProperty({
    description: 'Permisos específicos del usuario',
    enum: Permission,
    isArray: true,
    example: [Permission.READ_USER, Permission.CREATE_USER],
    type: [String],
  })
  permissions: Permission[];
}
