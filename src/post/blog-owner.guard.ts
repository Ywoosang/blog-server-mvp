import { 
    CanActivate, 
    ExecutionContext, 
    Injectable,
    BadRequestException
} from '@nestjs/common';
 
@Injectable()
export class BlogOwnerGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean {
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    const { userId } = request.params;
    if (user && userId) {
      if(isNaN(userId)) throw new BadRequestException('아이디 형식이 잘못되었습니다.');
      if (user.id === +userId) return true;
    }
    return false;
  }
}