import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import path from 'path';
import { AllConfigType } from 'src/configs/types/config.type';
import { MailerService } from 'src/mailer/mailer.service';
import { MailData } from './interfaces/mail-data.interface';
import { EMAIL_SUBJECT, CONTEXT } from 'src/configs/constants/constants';

@Injectable()
export class MailService {
    constructor(
        private readonly configService: ConfigService<AllConfigType>,
        private readonly mailerService: MailerService
    ) {}

    async sendVerificationEmail(mailData: MailData<{ hash: string }>): Promise<void> {
        const url = new URL(`${this.configService.get('app.backendDomain', { infer: true })}/auth/confirm-email`);
        url.searchParams.set('hash', mailData.data.hash);

        await this.mailerService.sendMail({
            to: mailData.to,
            subject: EMAIL_SUBJECT,
            templatePath: path.join(
                this.configService.getOrThrow('app.workingDirectory', { infer: true }),
                'src',
                'mail',
                'mail-templates',
                'confirmation.hbs'
            ),
            context: {
                title: CONTEXT.TITLE,
                url: url.toString(),
                actionTitle: CONTEXT.ACTION_TITLE,
                app_name: CONTEXT.APP_NAME,
                text: CONTEXT.TEXT
            }
        });
    }
}
