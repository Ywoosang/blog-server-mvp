import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { type SocialInterface } from 'src/social/social.interface';
import { type AuthGoogleLoginDto } from './dto/auth-google-login.dto';
import { type AllConfigType } from 'src/configs/types/config.type';

@Injectable()
export class AuthGoogleService {
    private readonly google: OAuth2Client;

    constructor(private readonly configService: ConfigService<AllConfigType>) {
        this.google = new OAuth2Client(
            configService.get('google.clientId', { infer: true }),
            configService.get('google.clientSecret', { infer: true }),
        );
    }

    async getProfileByToken(
        loginDto: AuthGoogleLoginDto,
    ): Promise<SocialInterface> {
        const ticket = await this.google.verifyIdToken({
            idToken: loginDto.idToken,
            audience: [
                this.configService.getOrThrow('google.clientId', {
                    infer: true,
                }),
            ],
        });

        const data = ticket.getPayload();

        if (!data) {
            throw new HttpException(
                {
                    status: HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                        user: 'wrongToken',
                    },
                },
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        return {
            id: data.sub,
            email: data.email,
            firstName: data.given_name,
            lastName: data.family_name,
        };
    }
}
