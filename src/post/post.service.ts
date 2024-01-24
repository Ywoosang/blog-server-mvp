import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostStatus } from './post-status.enum';
import { CreatePostDto } from './dto/create-post.dto';
import { FindOneOptions, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import { File as FileEntity } from 'src/files/entities/file.entity';
import { FindPostsDto } from './dto/find-posts.dto';
import { NullableType } from 'src/utils/types/nullable.type';
import { UsersService } from 'src/users/users.service';
import { CategoryService } from 'src/category/category.service';
import { TagService } from 'src/tag/tag.service';
import { Tag } from 'src/tag/entities/tag.entity';
import { FindPostsResponseDto } from './dto/find-posts-response.dto';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class PostService {
    constructor(
        @InjectRepository(Post)
        private postRepository: Repository<Post>,
        private usersService: UsersService,
        private categoryService: CategoryService,
        private tagService: TagService,
        private filesService: FilesService
    ) {}

    async getPostCount(status?: PostStatus): Promise<{ postCount: number }> {
        let postCount;
        if (status == PostStatus.PUBLIC) {
            postCount = await this.postRepository.count({
                where: {
                    status: PostStatus.PUBLIC
                }
            });
        } else {
            postCount = await this.postRepository.count();
        }

        return { postCount };
    }

    async findOne(findOptions: FindOneOptions<Post>): Promise<NullableType<Post>> {
        return this.postRepository.findOne(findOptions);
    }

    async findPostsPaginated(findPostsDto: FindPostsDto, isAdmin: boolean = false): Promise<FindPostsResponseDto> {
        let { page, limit } = findPostsDto;
        page = page ? page : 1;
        limit = limit ? limit : 15;
        const skip = (page - 1) * limit;
        const whereCondition: any = {};
        if (!isAdmin) {
            whereCondition.status = PostStatus.PUBLIC;
        }
        const [posts, total] = await this.postRepository.findAndCount({
            take: limit,
            skip,
            where: whereCondition,
            relations: ['tags']
        });

        return {
            posts,
            total
        };
    }

    async findPublicUserPosts(userId: number): Promise<NullableType<Post[]>> {
        const user: User = await this.usersService.findOne({
            where: {
                id: userId
            },
            relations: ['posts']
        });
        if (!user) throw new NotFoundException('존재하지 않는 사용자입니다.');

        return user.posts.filter(post => post.status === PostStatus.PUBLIC);
    }

    async create(createPostDto: CreatePostDto, user: User): Promise<Post> {
        const { title, content, description, status, categoryId, tagNames, imageIds } = createPostDto;

        let category;
        if (categoryId) {
            category = await this.categoryService.findOneById(categoryId);
            if (!category) {
                throw new NotFoundException('존재하지 않는 카테고리입니다.');
            }
        }

        const tags: Tag[] = [];
        if (tagNames) {
            for (const tagName of tagNames) {
                const tag = await this.tagService.createIfNotExistByName({ name: tagName });
                tags.push(tag);
            }
        }

        const images: FileEntity[] = [];
        if (imageIds) {
            for (const imageId of imageIds) {
                const imageFile = await this.filesService.findById(imageId);
                images.push(imageFile);
            }
        }

        return this.postRepository.save(
            this.postRepository.create({
                title,
                description,
                content,
                status,
                user,
                category,
                tags,
                images
            })
        );
    }

    async updateStatus(id: number, status: PostStatus): Promise<Post> {
        const post = await this.findOne({
            where: {
                id
            }
        });
        if (!post) throw new NotFoundException('존재하지 않는 게시물입니다.');
        post.status = status;
        await this.postRepository.save(post);

        return post;
    }

    async delete(id: number, user: User): Promise<void> {
        const post = await this.findOne({
            where: [
                { id },
                {
                    user: {
                        id: user.id
                    }
                }
            ]
        });
        await this.postRepository.remove(post);
    }
}
