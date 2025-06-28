import { User } from '@modules/auth/domain/entities/user.entity';

declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
  }
}
