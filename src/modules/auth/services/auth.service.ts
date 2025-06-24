import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '@modules/auth/domain/entities/user.entity';
import { Role } from '@modules/auth/domain/entities/role.entity';
import { RoleService } from '@modules/auth/services/role.service';
import { RegisterDto } from '@modules/auth/dto/register.dto';
import { LoginDto } from '@modules/auth/dto/login.dto';
import { Role as RoleEnum } from '@modules/auth/domain/enums/role.enum';
import { Permission } from '@modules/auth/domain/enums/permission.enum';
import { AuthResponseDto } from '@modules/auth/dto/auth-response.dto';
import { UserResponseDto } from '@modules/auth/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly roleService: RoleService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await hash(registerDto.password, 10);
    const viewerRole = (await this.roleService.findByName(
      RoleEnum.VIEWER,
    )) as Role;
    const user = this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      roles: [viewerRole],
    });

    await this.userRepository.save(user);

    return this.generateAuthResponse(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['roles'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateAuthResponse(user);
  }

  async getProfile(userId: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.name),
      permissions: this.flattenPermissions(user.roles),
      managedTeamId: user.managedTeamId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private generateAuthResponse(user: User): AuthResponseDto {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.name),
      permissions: this.flattenPermissions(user.roles),
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles.map((role) => role.name),
      },
    };
  }

  private flattenPermissions(roles: Role[]): Permission[] {
    const permissionsSet = new Set<Permission>();

    roles.forEach((role) => {
      role.permissions.forEach((permission) => {
        permissionsSet.add(permission);
      });
    });

    return Array.from(permissionsSet);
  }
}
