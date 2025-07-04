import { RequestUser } from '@modules/auth/interfaces/request-user.interface';

declare module 'fastify' {
  interface FastifyRequest {
    user?: RequestUser;
  }
}
