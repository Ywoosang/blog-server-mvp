import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { AllConfigType } from 'src/configs/types/config.type';
import { SocialData } from '../types/social-data.type';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private configService: ConfigService<AllConfigType>) {
        super({
            clientID: configService.get('google.clientId', { infer: true }),
            clientSecret: configService.get('google.clientSecret', { infer: true }),
            callbackURL: `${configService.get('app.backendDomain', { infer: true })}/auth/google/login`,
            scope: ['email', 'profile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any) {
        const { emails } = profile;
        const user: SocialData = {
            email: emails[0].value,
        };
        return user;
    }
}
