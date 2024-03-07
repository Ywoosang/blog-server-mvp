import { Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/utils/guards/admin.guard';
import { FindTagPostsDto } from './dto/find-tag-posts.dto';
import { Tag } from './entities/tag.entity';
import { FindTagsResponseDto } from './dto/find-tags-response.dto';
import { TagService } from './tag.service';
import { GetUser } from 'src/utils/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { NullableType } from 'src/utils/types/nullable.type';

@Controller('tags')
export class TagController {
    constructor(private readonly tagService: TagService) {}

    @Get()
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @HttpCode(HttpStatus.OK)
    async findTagsWithOneOrMorePosts(@GetUser() user: User): Promise<FindTagsResponseDto> {
        return this.tagService.findTagsWithOneOrMorePosts(user);
    }

    @Get('public')
    @HttpCode(HttpStatus.OK)
    async findTagsWithOneOrMorePublicPosts(): Promise<FindTagsResponseDto> {
        return this.tagService.findTagsWithOneOrMorePosts();
    }

    @Get('/public/:id')
    @HttpCode(HttpStatus.OK)
    async findTagPosts(@Param('id', ParseIntPipe) id: string, @Query() findTagPostsDto: FindTagPostsDto): Promise<NullableType<Tag>> {
        return this.tagService.findOneWithPosts(+id, findTagPostsDto);
    }

    @Get('/:id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async findPublicTagPosts(
        @Param('id', ParseIntPipe) id: string,
        @Query() findTagPostsDto: FindTagPostsDto
    ): Promise<NullableType<Tag>> {
        return this.tagService.findOneWithPosts(+id, findTagPostsDto, true);
    }
}
