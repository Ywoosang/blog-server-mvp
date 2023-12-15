import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NullableType } from 'src/utils/types/nullable.type';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { PostStatus } from 'src/post/post-status.enum';
import { FindCategoryPostsDto } from './dto/find-category-posts.dto';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>
    ) {}

    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        return this.categoryRepository.save(this.categoryRepository.create(createCategoryDto));
    }

    async findAll(): Promise<{ categories: NullableType<Category[]> }> {
        const categories = await this.categoryRepository.find();

        return { categories };
    }

    async findOne(
        id: number,
        findCategoryPostsDto: FindCategoryPostsDto,
        isAdmin: boolean = false
    ): Promise<NullableType<Category>> {
        let { page, limit } = findCategoryPostsDto;
        page = page ? page : 1;
        limit = limit ? limit : 15;
        const skip = (page - 1) * limit;
        const category = await this.categoryRepository.findOne({
            where: {
                id
            },
            relations: ['posts']
        });

        if (!category) {
            throw new NotFoundException('존재하지 않는 카테고리 입니다.');
        }

        if (!isAdmin) {
            category.posts = category.posts.filter(post => (post.status = PostStatus.PUBLIC));
        }
        category.posts = category.posts.slice(skip, skip + limit);

        return category;
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        const { name } = updateCategoryDto;
        const category = await this.categoryRepository.findOne({ where: { id } });
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
