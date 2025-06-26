import { Role } from '@modules/auth/domain/enums/role.enum';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @MinLength(6)
  @IsOptional()
  password: string;

  @IsArray()
  @IsEnum(Role, { each: true })
  @IsOptional()
  roles: Role[];

  @IsNumber()
  @IsOptional()
  managedTeamId?: number;
}
