import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { RefreshToken } from '@modules/auth/domain/entities/refresh-token.entity';
import { User } from '@modules/auth/domain/entities/user.entity';
import flattenPermissions from '@common/helpers/flattenPermissions';
import { parseTimeToMs } from '@common/utils/time.utils';
import {
  RefreshTokenPayload,
  TokenResponse,
} from '@modules/auth/interfaces/jwt-payload.interface';
import areArraysEqual from '@common/utils/areArraysEqual.util';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async generateTokens(
    user: User,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<TokenResponse> {
    const jwtExpiration = this.configService.get('jwt.expiresIn') as string;
    const refreshExpiration = this.configService.get(
      'jwt.refreshExpiresIn',
    ) as string;

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.name),
      permissions: flattenPermissions(user.roles),
      managedTeamId: user.managedTeamId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.secret'),
        expiresIn: jwtExpiration,
      }),
      this.jwtService.signAsync(
        { ...payload, tokenId: Date.now() },
        {
          secret: this.configService.get('jwt.refreshSecret'),
          expiresIn: refreshExpiration,
        },
      ),
    ]);

    const refreshExpiresAt = new Date(
      Date.now() + parseTimeToMs(refreshExpiration),
    );

    const refreshTokenEntity = this.refreshTokenRepository.create({
      token: refreshToken,
      user,
      userAgent,
      ipAddress,
      expiresAt: refreshExpiresAt,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return {
      user: {
        email: user.email,
        id: user.id,
        roles: user.roles.map((role) => role.name),
      },
      accessToken,
      refreshToken,
      expiresIn: parseTimeToMs(jwtExpiration),
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
      refreshToken,
      {
        secret: this.configService.get('jwt.refreshSecret') as string,
      },
    );

    const tokenEntity = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, revoked: false },
      relations: ['user', 'user.roles'],
    });

    if (!tokenEntity) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!tokenEntity || tokenEntity.expiresAt < new Date()) {
      await this.revokeToken(refreshToken);
      throw new UnauthorizedException('Refresh token expired');
    }

    if (
      tokenEntity.user.id !== payload.sub ||
      tokenEntity.user.email !== payload.email
    ) {
      await this.revokeToken(refreshToken);
      throw new UnauthorizedException('Token user mismatch');
    }

    const currentUserRoles = tokenEntity.user.roles.map((role) => role.name);
    const hasRolesChanged = !areArraysEqual(currentUserRoles, payload.roles);

    if (hasRolesChanged) {
      // Si los roles cambiaron, revocamos todos los tokens del usuario
      await this.revokeAllUserTokens(tokenEntity.user.id);
      throw new UnauthorizedException(
        'User roles have changed. Please login again',
      );
    }

    await this.cleanupExpiredTokens(tokenEntity.user.id);
    return this.generateTokens(tokenEntity.user, tokenEntity.ipAddress);
  }

  async revokeToken(refreshToken: string): Promise<void> {
    const tokenEntity = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });

    if (tokenEntity && !tokenEntity.revoked) {
      tokenEntity.revoked = true;
      tokenEntity.revokedAt = new Date();
      await this.refreshTokenRepository.save(tokenEntity);
    }
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, revoked: false },
      { revoked: true, revokedAt: new Date() },
    );
  }

  private async cleanupExpiredTokens(userId: number): Promise<void> {
    await this.refreshTokenRepository.delete({
      userId,
      expiresAt: LessThan(new Date()),
    });
  }
}
