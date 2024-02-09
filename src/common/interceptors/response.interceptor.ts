import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(data => {
                if (Array.isArray(data)) {
                    data = data.map(el => {
                        if (el.user) {
                            el.user = this.excludeFields(el.user);
                        }
                        return el;
                    })
                } else if (typeof data == 'object') {
                    if (data.user) {
                        data.user = this.excludeFields(data.user);
                    } else {
                        data = this.excludeFields(data);
                    }
                }
                return data;
            })
        );
    }

    private excludeFields(user: User): Partial<User> {
        const { password, refreshToken, ...rest } = user;
        return rest;
    }
}
