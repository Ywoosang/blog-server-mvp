import { Injectable, type NestInterceptor, type ExecutionContext, type CallHandler } from '@nestjs/common';
import { type Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { type User } from 'src/users/entities/user.entity';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest();
        const isLoginRequest = request.path === '/auth/login'; // 로그인 요청인지 확인
        return next.handle().pipe(
            map((data) => {
                if (Array.isArray(data)) {
                    data = data.map((el) => {
                        if (el.user) {
                            el.user = this.excludeFields(el.user as User);
                        }

                        return el;
                    });
                } else if (data != null && typeof data === 'object') {
                    if (data.user) {
                        data.user = this.excludeFields(data.user as User);
                    } else if (!isLoginRequest) {
                        data = this.excludeFields(data as User);
                    }
                }

                return data;
            }),
        );
    }

    private excludeFields(user: User): Partial<User> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { refreshToken, ...rest } = user;

        return rest;
    }
}
