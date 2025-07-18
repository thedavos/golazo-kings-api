import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '@modules/auth/domain/entities/user.entity';
import { Role } from '@modules/auth/domain/entities/role.entity';
import { RoleService } from '@modules/auth/services/role.service';
import { TokenService } from '@modules/auth/services/token.service';
import { RegisterDto } from '@modules/auth/dto/register.dto';
import { LoginDto } from '@modules/auth/dto/login.dto';
import { Role as RoleEnum } from '@modules/auth/domain/enums/role.enum';
import { UserResponseDto } from '@modules/auth/dto/user-response.dto';
import { CreateUserDto } from '@modules/auth/dto/create-user.dto';
import { UpdateUserDto } from '@modules/auth/dto/update-user.dto';
import flattenPermissions from '@common/helpers/flattenPermissions';
import { TokenResponseDto } from '@modules/auth/dto/token-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly roleService: RoleService,
    private readonly tokenService: TokenService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await hash(createUserDto.password, 10);

    const roles = (await Promise.all(
      createUserDto.roles.map((roleName) =>
        this.roleService.findByName(roleName),
      ),
    )) as Role[];

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      roles,
    });

    return this.userRepository.save(user);
  }

  async findAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['roles'],
      select: ['id', 'email', 'managedTeamId', 'createdAt', 'updatedAt'],
    });
  }

  async findUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
      select: ['id', 'email', 'managedTeamId', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findUserById(id);

    if (updateUserDto.password) {
      updateUserDto.password = await hash(updateUserDto.password, 10);
    }

    if (updateUserDto.roles) {
      user.roles = (await Promise.all(
        updateUserDto.roles.map((roleName) =>
          this.roleService.findByName(roleName),
        ),
      )) as Role[];
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async removeUser(id: number): Promise<void> {
    const user = await this.findUserById(id);
    await this.userRepository.remove(user);
  }

  async register(registerDto: RegisterDto): Promise<TokenResponseDto> {
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

    return this.tokenService.generateTokens(user);
  }

  async login(loginDto: LoginDto, userAgent?: string, ipAddress?: string) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['roles'],
    });

    if (!user || user.isBlocked) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      // Incrementar contador de intentos fallidos
      user.failedLoginAttempts += 1;

      // Bloquear cuenta después de 5 intentos fallidos
      if (user.failedLoginAttempts >= 5) {
        user.isBlocked = true;
      }

      await this.userRepository.save(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    user.failedLoginAttempts = 0;
    user.lastLoginAt = new Date();

    const savedUser = await this.userRepository.save(user);
    return this.tokenService.generateTokens(savedUser, userAgent, ipAddress);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokenService.revokeToken(refreshToken);
  }

  async refreshToken(refreshToken: string): Promise<TokenResponseDto> {
    return this.tokenService.refreshAccessToken(refreshToken);
  }

  async updatePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    user.password = await hash(newPassword, 10);
    await this.userRepository.save(user);
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
      user,
      roles: user.roles.map((role) => role.name),
      permissions: flattenPermissions(user.roles),
    };
  }
}
