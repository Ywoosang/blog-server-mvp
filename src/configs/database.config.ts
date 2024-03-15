import { registerAs } from '@nestjs/config';
import { type DatabaseConfig } from './types/config.type';
import { IsOptional, IsString, ValidateIf } from 'class-validator';

import validateConfig from 'src/utils/validate-config';

class EnvironmentVariablesValidator {
    @ValidateIf((envValues) => !envValues.DATABASE_URL)
    @IsString()
    DATABASE_TYPE: string;

    @ValidateIf((envValues) => !envValues.DATABASE_URL)
    @IsString()
    DATABASE_HOST: string;

    @ValidateIf((envValues) => !envValues.DATABASE_URL)
    @IsString()
    @IsOptional()
    DATABASE_PORT: number;

    @ValidateIf((envValues) => !envValues.DATABASE_URL)
    @IsString()
    @IsOptional()
    DATABASE_PASSWORD: string;

    @ValidateIf((envValues) => !envValues.DATABASE_URL)
    @IsString()
    DATABASE_NAME: string;

    @ValidateIf((envValues) => !envValues.DATABASE_URL)
    @IsString()
    DATABASE_USERNAME: string;

    @IsString()
    @IsOptional()
    DATABASE_SYNCHRONIZE: boolean;
}

export default registerAs<DatabaseConfig>('database', () => {
    validateConfig(process.env, EnvironmentVariablesValidator);

    return {
        type: process.env.DATABASE_TYPE,
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT
            ? parseInt(process.env.DATABASE_PORT, 10)
            : 3306,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        name: process.env.DATABASE_NAME,
        synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
    };
});
