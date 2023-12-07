import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';
import { Like } from './entities/like.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PostModule } from 'src/post/post.module';

@Module({
    imports: [TypeOrmModule.forFeature([Like]), AuthModule, PostModule],
    providers: [LikeService],
    exports: [LikeService],
    controllers: [LikeController]
})
export class LikeModule {}
