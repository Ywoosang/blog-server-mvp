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
        const { userId, exp } = payload;
        const user = await this.userRepository.findOne({
            where: {
                userId
            }
        });
        if (!user) throw new UnauthorizedException();
        // 토큰의 만료 시간을 한국 시간대로 변환하여 콘솔에 출력
        const expirationDate = new Date(exp * 1000);
        expirationDate.setTime(expirationDate.getTime() + (9 * 60 * 60 * 1000)); // 한국 시간대로 변환
        console.log(`JWT 만료기간 : ${expirationDate.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`);

        return user;
    }
}
