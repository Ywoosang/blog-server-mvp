import { registerAs } from '@nestjs/config';
import { AppConfig } from './types/config.type';
import { IsInt, IsOptional, IsUrl, Max, Min } from 'class-validator';

import validateConfig from 'src/utils/validate-config';

class EnvironmentVariablesValidator {
    @IsInt()
    @Min(0)
    @Max(65535)
    @IsOptional()
    APP_PORT: number;

    // TLD(Top-Level Domain) ex) .com, .org, .net
    @IsUrl({ require_tld: false })
    @IsOptional()
    APP_BACKEND_DOMAIN: string;

    @IsUrl({ require_tld: false })
    @IsOptional()
    APP_FRONTEND_DOMAIN: string;
}

export default registerAs<AppConfig>('app', () => {
    validateConfig(process.env, EnvironmentVariablesValidator);

    return {
        nodeEnv: process.env.NODE_ENV || 'dev',
        port: process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 3000,
        workingDirectory: process.env.PWD || process.cwd(),
        backendDomain: process.env.APP_BACKEND_DOMAIN || 'http://localhost:3000',
        frontendDomain: process.env.APP_FRONTEND_DOMAIN || 'http://localhost:8080'
    };
});
