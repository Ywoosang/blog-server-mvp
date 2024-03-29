import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { Post } from './entities/post.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { TagModule } from 'src/tag/tag.module';
import { CategoryModule } from 'src/category/category.module';
import { FilesModule } from 'src/files/files.module';

@Module({
    imports: [TypeOrmModule.forFeature([Post]), FilesModule, AuthModule, UsersModule, TagModule, CategoryModule],
    providers: [PostService],
    exports: [PostService],
    controllers: [PostController],
})
export class PostModule {}
