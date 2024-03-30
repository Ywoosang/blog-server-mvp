import { registerAs } from '@nestjs/config';
import { type KakaoConfig } from './types/config.type';
import { IsOptional, IsString } from 'class-validator';
import validateConfig from 'src/utils/validate-config';

class EnvironmentVariablesValidator {
    @IsString()
    @IsOptional()
    KAKAO_CLIENT_ID: string;

    @IsString()
    @IsOptional()
    KAKAO_CLIENT_SECRET: string;
}

export default registerAs<KakaoConfig>('kakao', () => {
    validateConfig(process.env, EnvironmentVariablesValidator);

    return {
        clientId: process.env.KAKAO_CLIENT_ID,
        clientSecret: process.env.KAKAO_CLIENT_SECRET,
    };
});
