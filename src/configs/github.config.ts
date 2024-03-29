import { registerAs } from '@nestjs/config';
import { type GithubConfig } from './types/config.type';
import { IsOptional, IsString } from 'class-validator';
import validateConfig from 'src/utils/validate-config';

class EnvironmentVariablesValidator {
    @IsString()
    @IsOptional()
    GITHUB_CLIENT_ID: string;

    @IsString()
    @IsOptional()
    GITHUB_CLIENT_SECRET: string;
}

export default registerAs<GithubConfig>('github', () => {
    validateConfig(process.env, EnvironmentVariablesValidator);

    return {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
    };
});
