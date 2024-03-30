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
    HttpStatus,
    NotFoundException,
    ForbiddenException,
    Put,
} from '@nestjs/common';
import { PostStatus } from './post-status.enum';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostStatusValidationPipe } from './pipes/post-status-validation.pipe';
import { Post as PostEntity } from './entities/post.entity';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { FindPostsResponseDto } from './dto/find-posts-response.dto';
import { FindPostsDto } from './dto/find-posts.dto';
import { AdminGuard } from '../utils/guards/admin.guard';
import { NullableType } from 'src/utils/types/nullable.type';
import { GetUser } from 'src/utils/decorators/get-user.decorator';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostController {
    constructor(private postService: PostService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @HttpCode(HttpStatus.CREATED)
    async createPost(@Body() createPostDto: CreatePostDto, @GetUser() user: User): Promise<PostEntity> {
        return this.postService.create(createPostDto, user);
    }

    @Get('/count')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @HttpCode(HttpStatus.OK)
    getTotalPostCount(): Promise<{ postCount: number }> {
        return this.postService.getPostCount();
    }

    @Get('/public/count')
    @HttpCode(HttpStatus.OK)
    getPublicPostCount(): Promise<{ postCount: number }> {
        return this.postService.getPostCount(PostStatus.PUBLIC);
    }

    @Get('/public')
    @HttpCode(HttpStatus.OK)
    getPublicPosts(@Query() findPostsDto: FindPostsDto): Promise<FindPostsResponseDto> {
        return this.postService.findPostsPaginated(findPostsDto);
    }

    @Get('/')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @HttpCode(HttpStatus.OK)
    getPosts(@Query() findPostsDto: FindPostsDto): Promise<FindPostsResponseDto> {
        return this.postService.findPostsPaginated(findPostsDto, true);
    }

    @Get('/public/:id')
    @HttpCode(HttpStatus.OK)
    async getPublicPostById(@Param('id') postId: number): Promise<NullableType<PostEntity>> {
        const post = await this.postService.findOne({
            where: {
                id: postId,
            },
            relations: ['user', 'tags', 'category'],
        });
        if (!post) throw new NotFoundException('존재하지 않는 게시물입니다.');
        if (post.status === PostStatus.PRIVATE) throw new ForbiddenException('게시물에 접근할 권한이 없습니다.');

        return post;
    }

    @Get('/:id')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @HttpCode(HttpStatus.OK)
    async getPostById(@Param('id') postId: number): Promise<PostEntity> {
        const post = await this.postService.findOne({
            where: {
                id: postId,
            },
            relations: ['user', 'tags', 'category'],
        });
        if (!post) throw new NotFoundException('존재하지 않는 게시물입니다.');

        return post;
    }

    @Put('/:id')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @HttpCode(HttpStatus.OK)
    async updatePost(@Param('id', ParseIntPipe) postId: number, @Body() updatePostDto: UpdatePostDto) {
        return this.postService.update(postId, updatePostDto);
    }

    @Patch('/:id/status')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async updatePostStatus(
        @Param('id', ParseIntPipe) postId: number,
        @Body('status', PostStatusValidationPipe) status: PostStatus,
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
