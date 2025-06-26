import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { RequirePermissions } from '@modules/auth/decorators/permissions.decorator';
import { Permission } from '@modules/auth/domain/enums/permission.enum';
import { AuthService } from '@modules/auth/services/auth.service';
import { CreateUserDto } from '@modules/auth/dto/create-user.dto';
import { UpdateUserDto } from '@modules/auth/dto/update-user.dto';

@Controller('users')
@RequirePermissions(Permission.MANAGE_ROLES)
export class UserController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @Get()
  findAll() {
    return this.authService.findAllUsers();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.authService.findUserById(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.authService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.authService.removeUser(id);
  }
}
