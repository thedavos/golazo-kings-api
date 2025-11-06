import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { FastifyRequest } from 'fastify';
import { Role } from '@modules/auth/domain/enums/role.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const user = request.user;

    if (user) {
      return user.roles.some((role) => role === Role.SUPER_ADMIN);
    }

    return false;
  }
}
