import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from '@modules/auth/services/auth.service';
import { RoleService } from '@modules/auth/services/role.service';
import { JwtStrategy } from '@modules/auth/strategies/jwt.strategy';
import { User } from '@modules/auth/domain/entities/user.entity';
import { Role } from '@modules/auth/domain/entities/role.entity';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@modules/auth/guards/permissions.guard';
import { AuthController } from '@modules/auth/controllers/auth.controller';
import { RoleController } from '@modules/auth/controllers/role.controller';
import { UserController } from '@modules/auth/controllers/user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn'),
        },
      }),
    }),
  ],
  controllers: [AuthController, RoleController, UserController],
  providers: [
    AuthService,
    RoleService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
  exports: [AuthService, RoleService],
})
export class AuthModule {}
