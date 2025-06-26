import { Role } from '@modules/auth/domain/enums/role.enum';
import { Permission } from '@modules/auth/domain/enums/permission.enum';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRoleDto {
  @IsEnum(Role, {
    message: 'Role must be one of the following: $value',
  })
  @IsNotEmpty()
  name: Role;

  @IsArray()
  @IsEnum(Permission, {
    message: 'Permission must be one of the following: $value',
  })
  permissions: Permission[];

  @IsString()
  @IsOptional()
  description?: string;
}
