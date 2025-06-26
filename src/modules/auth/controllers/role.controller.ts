import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { RequirePermissions } from '@modules/auth/decorators/permissions.decorator';
import { Permission } from '@modules/auth/domain/enums/permission.enum';
import { RoleService } from '@modules/auth/services/role.service';
import { CreateRoleDto } from '@modules/auth/dto/create-role.dto';
import { UpdateRoleDto } from '@modules/auth/dto/update-role.dto';

@Controller('roles')
@RequirePermissions(Permission.MANAGE_ROLES)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.findById(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.remove(id);
  }
}
