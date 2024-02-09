import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostStatus } from 'src/post/post-status.enum';
import { NullableType } from 'src/utils/types/nullable.type';
import { Repository } from 'typeorm';
import { FindTagPostsDto } from './dto/find-tag-posts.dto';
import { Tag } from './entities/tag.entity';
import { FindTagsResponseDto } from './dto/find-tags-response.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersRole } from 'src/users/users-role.enum';

@Injectable()
export class TagService {
    constructor(
        @InjectRepository(Tag)
        private tagRepository: Repository<Tag>
    ) {}

    async createIfNotExistByName(createTagDto: CreateTagDto): Promise<Tag> {
        const { name } = createTagDto;
        const tag = await this.tagRepository.findOne({
            where: {
                name
            }
        });
        if (tag) {
            return tag;
        }

        return this.tagRepository.save(this.tagRepository.create(createTagDto));
    }

    async findTagsWithOneOrMorePosts(user?: User): Promise<FindTagsResponseDto> {
        let query = this.tagRepository
            .createQueryBuilder('tag')
            .innerJoin('tag.posts', 'post_tag')
            .select(['tag.id', 'tag.name']);

        if (user && user.role == UsersRole.ADMIN) {
            query = query.addSelect(['COUNT(post_tag.id) as postCount']);
        } else {
            query = query
                .addSelect(['COUNT(CASE WHEN post_tag.status = :status THEN 1 END) as postCount'])
                .setParameter('status', PostStatus.PUBLIC);
        }

        const queryResult = await query.groupBy('tag.id, tag.name').having('postCount > 0').distinct(true).getRawMany();

        const tags = queryResult.map(tag => ({
            id: tag.tag_id as number,
            name: tag.tag_name as string,
            postCount: parseInt(tag.postCount)
        }));

        return { tags };
    }

    async findOneWithPosts(
        id: number,
        findTagPostsDto: FindTagPostsDto,
        isAdmin: boolean = false
    ): Promise<NullableType<Tag>> {
        let { page, limit } = findTagPostsDto;
        page = page ? page : 1;
        limit = limit ? limit : 15;
        const skip = (page - 1) * limit;
        const tag = await this.tagRepository.findOne({
            where: {
                id
            },
            relations: ['posts', 'posts.tags']
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
