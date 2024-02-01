import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { PostModule } from './post/post.module';
import { UsersModule } from './users/users.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { CategoryModule } from './category/category.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseTestModule } from './database/database-test.module';
import { DatabaseModule } from './database/database.module';
import appConfig from 'src/configs/app.config';
import authConfig from 'src/configs/auth.config';
import databaseConfig from 'src/configs/database.config';
import mailConfig from './configs/mail.config';
import { MailModule } from './mail/mail.moudle';
import { MailerModule } from './mailer/mailer.module';
import { HttpLoggerMiddleware } from './common/middlewares/http-logger.middleware';
import { TagModule } from './tag/tag.module';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import path from 'path';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load:
                process.env.NODE_ENV === 'test'
                    ? [appConfig, authConfig]
                    : [appConfig, authConfig, databaseConfig, mailConfig],
            envFilePath: `.env.${process.env.NODE_ENV}`
        }),
        ServeStaticModule.forRoot({
            rootPath: path.join(__dirname, '..', 'public'),
            serveRoot: '/static'
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
        FilesModule
    ]
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(HttpLoggerMiddleware).forRoutes('*');
    }
}
