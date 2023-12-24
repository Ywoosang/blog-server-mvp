import { registerAs } from '@nestjs/config';
import { MailConfig } from './types/config.type';
import { IsString, IsOptional, IsEmail } from 'class-validator';
import validateConfig from 'src/utils/validate-config';

class EnvironmentVariablesValidator {
    @IsString()
    MAIL_SERVICE: string;

    @IsString()
    @IsOptional()
    MAIL_USER: string;

    @IsString()
    @IsOptional()
    MAIL_PASSWORD: string;

    @IsEmail()
    MAIL_DEFAULT_EMAIL: string;
}

export default registerAs<MailConfig>('mail', () => {
    validateConfig(process.env, EnvironmentVariablesValidator);

    return {
        service: process.env.MAIL_SERVICE,
        user: process.env.MAIL_USER,
        password: process.env.MAIL_PASSWORD,
        defaultEmail: process.env.MAIL_DEFAULT_EMAIL
    };
});
