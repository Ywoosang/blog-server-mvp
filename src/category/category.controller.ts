import { Controller, Get, Post, Param, Body, Put, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/utils/guards/admin.guard';
import { FindCategoryPostsDto } from './dto/find-category-posts.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { NullableType } from 'src/utils/types/nullable.type';

@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    /**
     * 카테고리 생성 엔드포인트
     *
     * @param createCategoryDto - 새로운 카테고리 생성을 위한 데이터
     * @returns 생성된 카테고리 정보
     */
    @Post()
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
        return this.categoryService.create(createCategoryDto);
    }

    /**
     * 모든 카테고리와 해당 카테고리에 속한 게시물의 개수를 조회 엔드포인트
     *
     * @returns 카테고리 정보와 해당 카테고리에 속한 게시물의 개수
     */
    @Get()
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async findAllWithPostCount(): Promise<{ categories: { id: number; name: string; postCount: number }[] }> {
        return this.categoryService.findAllWithPostCount(true);
    }

    /**
     * 모든 카테고리와 해당 카테고리에 속한 PUBLIC 게시물의 개수를 조회 엔드포인트
     *
     * @returns 카테고리 정보와 해당 카테고리에 속한 PUBLIC 게시물의 개수
     */
    @Get('/public')
    async findAllWithPublicPostCount(): Promise<{ categories: { id: number; name: string; postCount: number }[] }> {
        return this.categoryService.findAllWithPostCount();
    }

    @Get('/list')
    async findAll(): Promise<{ categories: Category[] }> {
        return this.categoryService.findAll();
    }

    /**
     * 공개된 카테고리와 해당 카테고리의 포스트 조회 엔드포인트
     *
     * @param id - 조회할 카테고리의 식별자.
     * @param findCategoryPostsDto - 카테고리와 관련된 포스트 조회에 사용될 데이터
     * @returns 조회된 카테고리와 해당 카테고리의 포스트 정보
     */
    @Get('/public/:id')
    async findOneWithPostsByPublic(
        @Param('id', ParseIntPipe) id: number,
        @Query() findCategoryPostsDto: FindCategoryPostsDto
    ): Promise<NullableType<Category>> {
        return this.categoryService.findOneWithPosts(+id, findCategoryPostsDto);
    }

    /**
     * 특정 카테고리와 해당 카테고리의 포스트 조회 엔드포인트
     *
     * @param id - 조회할 카테고리의 식별자.
     * @param findCategoryPostsDto - 카테고리와 관련된 포스트 조회에 사용될 데이터
     * @returns 조회된 카테고리와 해당 카테고리의 포스트 정보
     */
    @Get('/:id')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async findOneWithPosts(
        @Param('id', ParseIntPipe) id: number,
        @Query() findCategoryPostsDto: FindCategoryPostsDto
    ): Promise<NullableType<Category>> {
        return this.categoryService.findOneWithPosts(+id, findCategoryPostsDto, true);
    }

    /**
     * 카테고리 정보 업데이트 엔드포인트
     *
     * @param id - 업데이트할 카테고리의 식별자
     * @param updateCategoryDto - 업데이트할 카테고리 정보
     * @returns 업데이트된 카테고리 정보
     */
    @Put(':id')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCategoryDto: UpdateCategoryDto
    ): Promise<Category> {
        return this.categoryService.update(+id, updateCategoryDto);
    }

    /**
     * 특정 카테고리 삭제 엔드포인트
     *
     * @param id - 삭제할 카테고리의 식별자
     */
    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.categoryService.remove(+id);
    }
}
