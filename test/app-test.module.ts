import 'dotenv/config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { PostModule } from 'src/post/post.module';
import { CommentModule } from 'src/comment/comment.module';
import { LikeModule } from 'src/like/like.module';
import { CategoryModule } from 'src/category/category.module';
import { TagModule } from 'src/tag/tag.module';
import { FilesModule } from 'src/files/files.module';
import { MailModule } from 'src/mail/mail.moudle';
import { MailerModule } from 'src/mailer/mailer.module';
import { DatabaseTestModule } from 'src/database/database-test.module';

import appConfig from 'src/configs/app.config';
import authConfig from 'src/configs/auth.config';
import mailConfig from 'src/configs/mail.config';
import googleConfig from 'src/configs/google.config';
import githubConfig from 'src/configs/github.config';
import kakaoConfig from 'src/configs/kakao.config';
import fileConfig from 'src/configs/files.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [appConfig, authConfig, mailConfig, googleConfig, githubConfig, kakaoConfig, fileConfig],
        }),
        DatabaseTestModule,
        AuthModule,
        UsersModule,
        PostModule,
        CommentModule,
        LikeModule,
        CategoryModule,
        TagModule,
        MailModule,
        MailerModule,
        FilesModule,
    ],
})
export class AppTestModule {}
