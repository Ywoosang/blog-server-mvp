import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AllConfigType } from 'src/configs/types/config.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private configService: ConfigService<AllConfigType>
    ) {
        super({
            // 토큰이 유효한지 체크
            secretOrKey: configService.get('auth.secret', { infer: true }),
            // bearer
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        });
    }

    async validate(payload: any) {
        const { userLoginId } = payload;
        const user: User = await this.userRepository.findOne({
            where: {
                userLoginId
            }
        });
        if (!user) throw new UnauthorizedException();

        return user;
    }
}
