import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PostModule } from 'src/post/post.module';

@Module({
    imports: [TypeOrmModule.forFeature([Comment]), AuthModule, PostModule],
    controllers: [CommentController],
    providers: [CommentService]
})
export class CommentModule {}
