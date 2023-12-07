import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UsersRole } from 'src/users/users-role.enum';

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const { user } = request;

        return user.role === UsersRole.ADMIN;
    }
}
