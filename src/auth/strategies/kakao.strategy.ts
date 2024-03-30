import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { AllConfigType } from 'src/configs/types/config.type';
import { SocialData } from '../types/social-data.type';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
    constructor(private configService: ConfigService<AllConfigType>) {
        super({
            clientID: configService.get('kakao.clientId', { infer: true }),
            clientSecret: configService.get('kakao.clientSecret', { infer: true }),
            callbackURL: `${configService.get('app.backendDomain', { infer: true })}/auth/kakao/login`,
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any) {
        const { _json } = profile;
        const user: SocialData = {
            email: _json.kakao_account.email,
        };
        return user;
    }
}
