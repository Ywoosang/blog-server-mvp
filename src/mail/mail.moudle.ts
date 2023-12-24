import { Module } from '@nestjs/common';
import { MailerModule } from 'src/mailer/mailer.module';
import { MailerService } from 'src/mailer/mailer.service';
import { MailService } from './mail.service';

@Module({
    imports: [MailerModule],
    providers: [MailerService, MailService],
    exports: [MailService]
})
export class MailModule {}
