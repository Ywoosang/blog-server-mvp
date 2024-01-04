import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostStatus } from 'src/post/post-status.enum';
import { NullableType } from 'src/utils/types/nullable.type';
import { Repository } from 'typeorm';
import { FindTagPostsDto } from './dto/find-tag-posts.dto';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagService {
    constructor(
        @InjectRepository(Tag)
        private tagRepository: Repository<Tag>
    ) {}

    async findAll(): Promise<{ tags: NullableType<Tag[]> }> {
        const tags = await this.tagRepository
            .createQueryBuilder('tag')
            .innerJoin('tag.posts', 'post_tag')
            .select(['tag.id', 'tag.name'])
            .distinct(true)
            .getMany();

        return { tags };
    }

    async findOne(id: number, findTagPostsDto: FindTagPostsDto, isAdmin: boolean = false): Promise<NullableType<Tag>> {
        let { page, limit } = findTagPostsDto;
        page = page ? page : 1;
        limit = limit ? limit : 15;
        const skip = (page - 1) * limit;
        const tag = await this.tagRepository.findOne({
            where: {
                id
            },
            relations: ['posts']
        });

        if (!tag) {
            throw new NotFoundException('존재하지 않는 태그입니다.');
        }

        if (!isAdmin) {
            tag.posts = tag.posts.filter(post => (post.status = PostStatus.PUBLIC));
        }
        tag.posts = tag.posts.slice(skip, skip + limit);

        return tag;
    }
}
