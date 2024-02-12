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
            secretOrKey: configService.get('auth.refreshSecret', { infer: true }),
            jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
            passReqToCallback: true
        });
    }

    async validate(request: Request, payload: any) {
        // payload : JWT 토큰의 디코딩 결과로 나온 객체
        // 페이로드에 토큰에 포함된 클레임 들이포함되어 있음
        const userId = payload.userId;
        if (!userId) {
            throw new UnauthorizedException();
        }

        const user: User = await this.userRepository.findOne({
            where: {
                userId
            }
        });
        if (!user) {
            throw new UnauthorizedException();
        }

        const refreshTokenFromBody = request.body.refreshToken;
        const isMatch = await bcrypt.compare(refreshTokenFromBody, user.refreshToken);

        if (isMatch) {
            return user;
        } else {
            throw new UnauthorizedException();
        }
    }
}
