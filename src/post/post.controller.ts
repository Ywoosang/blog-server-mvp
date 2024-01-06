import {
    Body,
    Param,
    Controller,
    Get,
    Post,
    Delete,
    Patch,
    ParseIntPipe,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { PostStatus } from './post-status.enum';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostStatusValidationPipe } from './pipes/post-status-validation.pipe';
import { Post as PostEntity } from './entities/post.entity';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { FindPostsDto } from './dto/find-posts.dto';
import { AdminGuard } from '../utils/guards/admin.guard';
import { NullableType } from 'src/utils/types/nullable.type';
import { GetUser } from 'src/utils/decorators/get-user.decorator';

@Controller('posts')
export class PostController {
    constructor(private postService: PostService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @HttpCode(HttpStatus.CREATED)
    async createPost(@Body() createPostDto: CreatePostDto, @GetUser() user: User): Promise<PostEntity> {
        return this.postService.create(createPostDto, user);
    }

    @Get('/public')
    @HttpCode(HttpStatus.OK)
    getPublicPosts(@Query('page') page: number = 1, @Query('limit') limit: number = 15): Promise<FindPostsDto> {
        return this.postService.findPostsPaginated(page, limit);
    }

    @Get('/')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @HttpCode(HttpStatus.OK)
    getPosts(@Query('page') page: number = 1, @Query('limit') limit: number = 15): Promise<FindPostsDto> {
        return this.postService.findPostsPaginated(page, limit, true);
    }

    @Get('/public/:id')
    @HttpCode(HttpStatus.OK)
    async getPostById(@Param('id') postId: number): Promise<NullableType<PostEntity>> {
        return this.postService.findOne({
            where: {
                id: postId,
                status: PostStatus.PUBLIC
            },
            relations: ['user']
        });
    }

    @Get('/:id')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @HttpCode(HttpStatus.OK)
    async getPrivatePostById(@Param('id') postId: number): Promise<PostEntity> {
        return this.postService.findOne({
            where: {
                id: postId
            },
            relations: ['user']
        });
    }

    @Patch('/:id/status')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async updatePostStatus(
        @Param('id', ParseIntPipe) postId: number,
        @Body('status', PostStatusValidationPipe) status: PostStatus
    ): Promise<PostEntity> {
        return this.postService.updateStatus(postId, status);
    }

    @Delete('/:id')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @HttpCode(HttpStatus.OK)
    async deletePost(@Param('id', ParseIntPipe) postId: number, @GetUser() user: User): Promise<void> {
        return this.postService.delete(postId, user);
    }
}
