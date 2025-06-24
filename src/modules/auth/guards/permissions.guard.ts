import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { Permission } from '@modules/auth/domain/enums/permission.enum';
import { PERMISSIONS_KEY } from '@modules/auth/decorators/permissions.decorator';
import { RequestUser } from '@modules/auth/interfaces/request-user.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context
      .switchToHttp()
      .getRequest<FastifyRequest & { user: RequestUser }>();

    return requiredPermissions.every((permission) =>
      user.permissions.includes(permission),
    );
  }
}
