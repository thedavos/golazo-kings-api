import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { RequestUser } from '@modules/auth/interfaces/request-user.interface';

export const CurrentUser = createParamDecorator(
  (_, context: ExecutionContext): RequestUser | null => {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<FastifyRequest>();

    return request.user || null;
  },
);
