import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/utils/guards/admin.guard';
import { NullableType } from 'src/utils/types/nullable.type';
import { FindTagPostsDto } from './dto/find-tag-posts.dto';
import { Tag } from './entities/tag.entity';
import { TagService } from './tag.service';

@Controller('tags')
export class TagController {
    constructor(private readonly tagService: TagService) {}

    @Get()
    async findAll(): Promise<{ tags: NullableType<Tag[]> }> {
        return this.tagService.findAll();
    }

    @Get('/public/:id')
    async getTagPosts(@Param('id') id: string, @Query() findTagPostsDto: FindTagPostsDto): Promise<Tag> {
        return this.tagService.findOne(+id, findTagPostsDto);
    }

    @Get('/:id')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async getPublicTagPosts(@Param('id') id: string, @Query() findTagPostsDto: FindTagPostsDto): Promise<Tag> {
        return this.tagService.findOne(+id, findTagPostsDto, true);
    }
}
