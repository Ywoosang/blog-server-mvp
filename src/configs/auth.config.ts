import { registerAs } from '@nestjs/config';
import { type AuthConfig } from './types/config.type';
import { IsString } from 'class-validator';
import validateConfig from 'src/utils/validate-config';

class EnvironmentVariablesValidator {
    @IsString()
    AUTH_JWT_SECRET: string;

    @IsString()
    AUTH_JWT_TOKEN_EXPIRES_IN: string;

    @IsString()
    AUTH_REFRESH_SECRET: string;

    @IsString()
    AUTH_REFRESH_TOKEN_EXPIRES_IN: string;

    @IsString()
    AUTH_CONFIRM_EMAIL_SECRET: string;

    @IsString()
    AUTH_EMAIL_TOKEN_EXPIRES_IN: string;
}

export default registerAs<AuthConfig>('auth', () => {
    validateConfig(process.env, EnvironmentVariablesValidator);

    return {
        secret: process.env.AUTH_JWT_SECRET,
        expires: process.env.AUTH_JWT_TOKEN_EXPIRES_IN,
        refreshSecret: process.env.AUTH_REFRESH_SECRET,
        refreshExpires: process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN,
        confirmEmailSecret: process.env.AUTH_CONFIRM_EMAIL_SECRET,
        emailExpires: process.env.AUTH_EMAIL_TOKEN_EXPIRES_IN,
    };
});
