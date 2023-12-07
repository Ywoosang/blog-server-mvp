import { Module } from '@nestjs/common';
import { PostModule } from './post/post.module';
import { UsersModule } from './users/users.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseTestModule } from './database/database-test.module';
import { DatabaseModule } from './database/database.module';
import appConfig from 'src/configs/app.config';
import authConfig from 'src/configs/auth.config';
import databaseConfig from 'src/configs/database.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: process.env.NODE_ENV === 'test' ? [] : [appConfig, authConfig, databaseConfig],
            envFilePath: `.env.${process.env.NODE_ENV}`
        }),
        process.env.NODE_ENV === 'test' ? DatabaseTestModule : DatabaseModule,
        AuthModule,
        UsersModule,
        PostModule,
        CommentModule,
        LikeModule
    ]
})
export class AppModule {}
