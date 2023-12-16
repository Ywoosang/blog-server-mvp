import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AllConfigType } from 'src/configs/types/config.type';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private configService: ConfigService<AllConfigType>
    ) {
        super({
            // 토큰이 유효한지 체크
            secretOrKey: configService.get('auth.refreshSecret', { infer: true }),
            // refreshToken
            jwtFromRequest: ExtractJwt.fromExtractors([
                request => {
                    return request.cookies.Refresh;
                }
            ]),
            // req 객체 사용
            passReqToCallback: true
        });
    }

    async validate(request: Request, payload: any) {
        const { userLoginId } = payload;
        const user: User = await this.userRepository.findOne({
            where: {
                userLoginId
            }
        });
        if (!user) {
            throw new UnauthorizedException();
        }

        const refreshToken = request.cookies.Refresh;
        const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
        if (isMatch) {
            return user;
        }
    }
}
