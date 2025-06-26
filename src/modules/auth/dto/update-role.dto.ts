import { PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from '@modules/auth/dto/create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
