import { Module } from '@nestjs/common';
import { PostModule } from './post/post.module';
import { UsersModule } from './users/users.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import authConfig from 'src/configs/auth.config';
import appConfig from 'src/configs/app.config';
import databaseConfig from 'src/configs/database.config';
import { User } from 'src/users/entities/user.entity';
import { Post } from 'src/post/entities/post.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { Like } from 'src/like/entities/like.entity';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: process.env.NODE_ENV === 'test' ? [] : [
				appConfig,
				authConfig,
				databaseConfig
			],
			envFilePath: `.env.${process.env.NODE_ENV}`,
		}),
		TypeOrmModule.forRootAsync({
			useFactory: (config) => {
				if(process.env.NODE_ENV === 'test') {
					return {
						type: 'sqlite',
						database: ':memory:',
						synchronize: true,
						entities: [
							User,
							Post,
							Comment,
							Like
						]
					}
				} else {
					return {
						type: config.get('database.type', { infer: true }),
						host: config.get('database.host', { infer: true }),
						port: config.get('database.port', { infer: true }),
						username: config.get('database.username', { infer: true }),
						password: config.get('database.password', { infer: true }),
						database: config.get('database.name', { infer: true }),
						synchronize: config.get('database.synchronize', { infer: true }),
						entities: [
							User,
							Post,
							Comment,
							Like
						]
					}
				}
			},
			inject: [ConfigService],
		}),
		AuthModule,
		UsersModule,
		PostModule,
		CommentModule,
		LikeModule
	]
})

export class AppModule { }
