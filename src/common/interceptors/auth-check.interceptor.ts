import {
    Injectable,
    type NestInterceptor,
    type ExecutionContext,
    type CallHandler,
    UnauthorizedException,
} from '@nestjs/common';
import { type Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { type AllConfigType } from 'src/configs/types/config.type';
import { User } from 'src/users/entities/user.entity';
import { type IncomingHttpHeaders } from 'http';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthCheckInterceptor implements NestInterceptor {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService<AllConfigType>,
    ) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const headers: IncomingHttpHeaders = request.headers;
        const token = this.extractTokenFromHeader(headers);
        if (token) {
            try {
                const userData = await this.jwtService.verifyAsync<{
                    userId: User['userId'];
                }>(token, {
                    secret: this.configService.getOrThrow('auth.secret', {
                        infer: true,
                    }),
                });
                const userId = userData.userId;
                const user = await this.userRepository.findOne({
                    where: {
                        userId,
                    },
                });
                request.user = user;
            } catch (e) {
                throw new UnauthorizedException('로그인이 만료되었습니다. 다시 로그인해주세요.');
            }
        }
        return next.handle();
    }

    private extractTokenFromHeader(headers: IncomingHttpHeaders): string | undefined {
        const [type, token] = headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
