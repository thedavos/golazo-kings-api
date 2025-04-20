import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // const request = context.switchToHttp().getRequest();
    // Asume que tienes la info del usuario en request (ej. desde un JwtAuthGuard global)
    // const user = request.user;

    // --- IMPLEMENTA LÓGICA DE AUTORIZACIÓN AQUÍ ---
    // Ejemplo: Verificar si el usuario tiene el rol 'admin'
    // const isAdmin = user && user.roles && user.roles.includes('admin');

    // if (!isAdmin) {
    // Puedes lanzar una excepción o simplemente retornar false
    // throw new ForbiddenException('Access denied. Admin privileges required.');
    // return false;
    // }
    console.log('AdminGuard: ', context.switchToHttp().getRequest());
    return true;
  }
}
