import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MinLength,
  IsString,
} from 'class-validator';
import { Role } from '@modules/auth/domain/enums/role.enum';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsArray()
  @IsEnum(Role, { each: true })
  roles: Role[];

  @IsNumber()
  @IsOptional()
  managedTeamId?: number;
}
