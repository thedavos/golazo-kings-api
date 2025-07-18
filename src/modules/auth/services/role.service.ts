import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '@modules/auth/domain/entities/role.entity';
import { Role as RoleEnum } from '@modules/auth/domain/enums/role.enum';
import { Permission } from '@modules/auth/domain/enums/permission.enum';
import { CreateRoleDto } from '@modules/auth/dto/create-role.dto';
import { UpdateRoleDto } from '@modules/auth/dto/update-role.dto';

@Injectable()
export class RoleService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    await this.initializeRoles();
  }

  async findByName(name: RoleEnum): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { name },
    });
  }

  hasPermission(role: Role, permission: Permission): boolean {
    return role.permissions.includes(permission);
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new Error('Role already exists');
    }

    const role = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  async findById(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findById(id);
    Object.assign(role, updateRoleDto);
    return this.roleRepository.save(role);
  }

  async remove(id: number): Promise<void> {
    const role = await this.findById(id);
    await this.roleRepository.remove(role);
  }

  private async initializeRoles() {
    const roles = [
      {
        name: RoleEnum.SUPER_ADMIN,
        permissions: Object.values(Permission),
        description: 'Super administrator with all permissions',
      },
      {
        name: RoleEnum.LEAGUE_MANAGER,
        permissions: [
          Permission.READ_LEAGUE,
          Permission.UPDATE_LEAGUE,
          Permission.MANAGE_LEAGUE_SETTINGS,
          Permission.CREATE_TEAM,
          Permission.READ_TEAM,
          Permission.UPDATE_TEAM,
          Permission.DELETE_TEAM,
          Permission.SCRAPE_TEAMS,
          Permission.CREATE_MATCH,
          Permission.UPDATE_MATCH,
          Permission.DELETE_MATCH,
          Permission.REPORT_MATCH_RESULT,
        ],
        description: 'Gestor de liga',
      },
      {
        name: RoleEnum.TEAM_MANAGER,
        permissions: [
          Permission.READ_TEAM,
          Permission.UPDATE_TEAM,
          Permission.MANAGE_TEAM_PLAYERS,
          Permission.CREATE_PLAYER,
          Permission.READ_PLAYER,
          Permission.UPDATE_PLAYER,
          Permission.DELETE_PLAYER,
          Permission.SCRAPE_PLAYERS,
          Permission.READ_MATCH,
          Permission.REPORT_MATCH_RESULT,
        ],
        description: 'Gestor de equipo',
      },
      {
        name: RoleEnum.CONTENT_EDITOR,
        permissions: [
          Permission.MANAGE_IMAGES,
          Permission.MANAGE_NEWS,
          Permission.PUBLISH_CONTENT,
          Permission.READ_LEAGUE,
          Permission.READ_TEAM,
          Permission.READ_PLAYER,
          Permission.READ_MATCH,
        ],
        description: 'Editor de contenido',
      },
      {
        name: RoleEnum.VIEWER,
        permissions: [
          Permission.READ_LEAGUE,
          Permission.READ_TEAM,
          Permission.READ_PLAYER,
          Permission.READ_MATCH,
        ],
        description: 'Usuario con permisos de lectura',
      },
    ];

    for (const roleData of roles) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        await this.roleRepository.save(roleData);
      }
    }
  }
}
