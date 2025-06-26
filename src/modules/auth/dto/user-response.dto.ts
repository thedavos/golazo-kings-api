import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@modules/auth/domain/enums/role.enum';
import { Permission } from '@modules/auth/domain/enums/permission.enum';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  roles: Role[];

  @ApiProperty()
  permissions: Permission[];

  @ApiProperty()
  managedTeamId?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
