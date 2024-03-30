import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NullableType } from 'src/utils/types/nullable.type';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { PostStatus } from 'src/post/post-status.enum';
import { FindCategoryPostsDto } from './dto/find-category-posts.dto';
import { POST_PER_PAGE } from 'src/common/consts';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) {}

    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        const { name } = createCategoryDto;
        const category = await this.findOneByName(name);
        if (category) throw new ConflictException('이미 존재하는 카테고리입니다.');

        return this.categoryRepository.save(this.categoryRepository.create(createCategoryDto));
    }

    async findAll(): Promise<{ categories: Category[] }> {
        const categories = await this.categoryRepository.find();

        return { categories };
    }

    async findAllWithPostCount(isAdmin: boolean = false): Promise<{
        categories: { id: number; name: string; postCount: number }[];
    }> {
        const query = this.categoryRepository.createQueryBuilder('category');
        query
            .leftJoin(
                'post',
                'post',
                isAdmin ? 'category.id = post.categoryId' : 'category.id = post.categoryId AND post.status = :status',
                { status: PostStatus.PUBLIC },
            )
            .select(['category.id AS id', 'category.name AS name', 'COALESCE(COUNT(post.id),0) AS postCount'])
            .addGroupBy('category.id')
            .addGroupBy('category.name');
        const categories = await query.getRawMany();

        return { categories };
    }

    async findOneById(id: number): Promise<NullableType<Category>> {
        return this.categoryRepository.findOne({
            where: {
                id,
            },
        });
    }

    async findOneByName(name: string): Promise<NullableType<Category>> {
        return this.categoryRepository.findOne({
            where: {
                name,
            },
        });
    }

    async findOneWithPosts(
        id: number,
        findCategoryPostsDto: FindCategoryPostsDto,
        isAdmin: boolean = false,
    ): Promise<NullableType<Category>> {
        let { page, limit } = findCategoryPostsDto;
        page = page ? page : 1;
        limit = limit ? limit : POST_PER_PAGE;
        const skip = (page - 1) * limit;
        const category = await this.categoryRepository.findOne({
            where: {
                id,
            },
            relations: ['posts', 'posts.tags'],
        });

        if (!category) {
            throw new NotFoundException('존재하지 않는 카테고리 입니다.');
        }

        if (!isAdmin) {
            category.posts = category.posts.filter((post) => (post.status = PostStatus.PUBLIC));
        }
        category.posts = category.posts.slice(skip, skip + limit);

        return category;
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        const { name } = updateCategoryDto;
        const category = await this.categoryRepository.findOne({
            where: { id },
        });
        if (!category) {
            throw new NotFoundException('존재하지 않는 카테고리 입니다.');
        }
        category.name = name;

        return this.categoryRepository.save(category);
    }

    async remove(id: number): Promise<void> {
        await this.categoryRepository.delete(id);
    }
}
