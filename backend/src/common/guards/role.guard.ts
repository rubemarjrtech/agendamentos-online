import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Roles } from '@prisma/client';

@Injectable()
export class RoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== Roles.ADMIN) {
      throw new ForbiddenException('Acesso permitido apenas para administradores');
    }

    return true;
  }
}
