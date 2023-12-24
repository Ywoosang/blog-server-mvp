import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fs from 'node:fs/promises';
import Handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import { AllConfigType } from 'src/configs/types/config.type';

@Injectable()
export class MailerService {
    private readonly transporter: nodemailer.Transporter;

    constructor(private readonly configService: ConfigService<AllConfigType>) {
        this.transporter = nodemailer.createTransport({
            service: configService.get('mail.service', { infer: true }),
            auth: {
                user: configService.get('mail.user', { infer: true }),
                pass: configService.get('mail.password', { infer: true })
            }
        });
    }

    async sendMail({
        templatePath,
        context,
        ...mailOptions
    }: nodemailer.SendMailOptions & {
        templatePath: string;
        context: Record<string, unknown>;
    }): Promise<void> {
        let html: string;
        if (templatePath) {
            const template = await fs.readFile(templatePath, 'utf-8');
            html = Handlebars.compile(template, {
                strict: true
            })(context);
        }
        await this.transporter.sendMail({
            ...mailOptions,
            from: this.configService.get('mail.defaultEmail', { infer: true }),
            html
        });
    }
}
