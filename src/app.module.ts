import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import path from 'path';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { CategoryModule } from './category/category.module';
import { TagModule } from './tag/tag.module';
import { FilesModule } from './files/files.module';
import { MailModule } from './mail/mail.moudle';
import { MailerModule } from './mailer/mailer.module';
import { DatabaseModule } from './database/database.module';
import { DatabaseTestModule } from './database/database-test.module';

import appConfig from './configs/app.config';
import authConfig from './configs/auth.config';
import databaseConfig from './configs/database.config';
import mailConfig from './configs/mail.config';
import googleConfig from './configs/google.config';
import githubConfig from './configs/github.config';
import kakaoConfig from './configs/kakao.config';
import fileConfig from './configs/files.config';

import { HttpLoggerMiddleware } from './common/middlewares/http-logger.middleware';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [
                appConfig,
                authConfig,
                databaseConfig,
                mailConfig,
                googleConfig,
                githubConfig,
                kakaoConfig,
                fileConfig,
            ],
        }),
        ServeStaticModule.forRoot({
            rootPath: path.join(__dirname, '..', 'public'),
            serveRoot: '/static',
        }),
        process.env.NODE_ENV === 'test' ? DatabaseTestModule : DatabaseModule,
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
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(HttpLoggerMiddleware).forRoutes('*');
    }
}
