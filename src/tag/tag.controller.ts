import { Controller, Get, HttpCode, HttpStatus, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/utils/guards/admin.guard';
import { FindTagPostsDto } from './dto/find-tag-posts.dto';
import { Tag } from './entities/tag.entity';
import { FindTagsResponseDto } from './dto/find-tags-response.dto';
import { TagService } from './tag.service';

@Controller('tags')
export class TagController {
    constructor(private readonly tagService: TagService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    async findTagsWithOneOrMorePosts(): Promise<FindTagsResponseDto> {
        return this.tagService.findTagsWithOneOrMorePosts();
    }

    @Get('/public/:id')
    @HttpCode(HttpStatus.OK)
    async getTagPosts(@Param('id') id: string, @Query() findTagPostsDto: FindTagPostsDto): Promise<Tag> {
        return this.tagService.findOneWithPosts(+id, findTagPostsDto);
    }

    @Get('/:id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async getPublicTagPosts(@Param('id') id: string, @Query() findTagPostsDto: FindTagPostsDto): Promise<Tag> {
        return this.tagService.findOneWithPosts(+id, findTagPostsDto, true);
    }
}
