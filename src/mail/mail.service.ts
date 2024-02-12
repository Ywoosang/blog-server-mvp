import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import path from 'path';
import { AllConfigType } from 'src/configs/types/config.type';
import { MailerService } from 'src/mailer/mailer.service';
import { MailData } from './interfaces/mail-data.interface';
import { LOGIN_SUBJECT, REGISTER_SUBJECT } from 'src/mail/constants/constants';

@Injectable()
export class MailService {
    private mailTemplateDir;
    private baseUrl;

    constructor(
        private readonly configService: ConfigService<AllConfigType>,
        private readonly mailerService: MailerService
    ) {
        this.mailTemplateDir = path.join(
            this.configService.getOrThrow('app.workingDirectory', { infer: true }),
            'src',
            'mail',
            'mail-templates',
        )
        this.baseUrl = this.configService.get('app.frontendDomain', { infer: true })
    }

    async sendLoginEmail(mailData: MailData<{ hash: string }>): Promise<void> {
        const url = new URL(`${this.baseUrl}/auth/login`);
        url.searchParams.set('hash', mailData.data.hash);

        await this.mailerService.sendMail({
            to: mailData.to,
            subject: LOGIN_SUBJECT,
            templatePath: path.join(
                this.mailTemplateDir,
                'authentication.hbs'
            ),
            context: {
                homeUrl: this.baseUrl,
                actionUrl: url.toString(),
                actionText: '로그인',
                greeting: '어서오세요.',
                linkValidity: 24
            }
        });
    }


    async sendRegisterEmail(mailData: MailData<{ hash: string }>): Promise<void> {
        const url = new URL(`${this.baseUrl}/auth/register`);
        url.searchParams.set('hash', mailData.data.hash);

        await this.mailerService.sendMail({
            to: mailData.to,
            subject: REGISTER_SUBJECT,
            templatePath: path.join(
                this.mailTemplateDir,
                'authentication.hbs'
            ),
            context: {
                homeUrl: this.baseUrl,
                actionUrl: url.toString(),
                actionText: '회원가입',
                greeting: '환영합니다.',
                linkValidity: 24
            }
        });
    }
}
