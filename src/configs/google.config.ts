import { registerAs } from '@nestjs/config';
import { type GoogleConfig } from './types/config.type';
import { IsOptional, IsString } from 'class-validator';
import validateConfig from 'src/utils/validate-config';

class EnvironmentVariablesValidator {
    @IsString()
    @IsOptional()
    GOOGLE_CLIENT_ID: string;

    @IsString()
    @IsOptional()
    GOOGLE_CLIENT_SECRET: string;
}

export default registerAs<GoogleConfig>('google', () => {
    validateConfig(process.env, EnvironmentVariablesValidator);

    return {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    };
});
