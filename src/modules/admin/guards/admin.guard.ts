import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { FastifyRequest } from 'fastify';
import { Role } from '@modules/auth/domain/enums/role.enum';
import { RequestUser } from '@modules/auth/interfaces/request-user.interface';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest & { user: RequestUser }>();
    const user = request.user as RequestUser;

    return user && user.roles.some((role) => role.includes(Role.SUPER_ADMIN));
  }
}
