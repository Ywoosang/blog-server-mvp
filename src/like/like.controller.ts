import { Controller, Get, Post, Delete, Param, ParseIntPipe, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';

import { LikeService } from './like.service';
import { GetUser } from 'src/auth/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { PostExistGuard } from 'src/post/guards/post-exist.guard';
import { PublicPostGuard } from 'src/post/guards/public-post.guard';
import { LikeExistGuard } from './guards/like-exist.guard';

@Controller('likes')
export class LikeController {
    constructor(private likeService: LikeService) {}

    @Post('/posts/:id')
    @UseGuards(AuthGuard('jwt'), PublicPostGuard, LikeExistGuard)
    @HttpCode(HttpStatus.CREATED)
    async createLikeByPost(@Param('id', ParseIntPipe) postId: number, @GetUser() user: User) {
        const userId = user.id;

        return this.likeService.create(userId, postId);
    }

    @Get('/posts/:id')
    @UseGuards(PostExistGuard)
    @HttpCode(HttpStatus.OK)
    async findLikesByPost(@Param('id', ParseIntPipe) postId: number) {
        return this.likeService.findMany({
            where: {
                post: {
                    id: postId
                }
            },
            relations: ['user']
        });
    }

    @Delete('/posts/:id')
    @UseGuards(AuthGuard('jwt'), PublicPostGuard)
    @HttpCode(HttpStatus.OK)
    async deleteLikeByPost(@Param('id', ParseIntPipe) postId: number, @GetUser() user: User) {
        await this.likeService.delete({
            post: {
                id: postId
            },
            user: {
                id: user.id
            }
        });
    }
}
