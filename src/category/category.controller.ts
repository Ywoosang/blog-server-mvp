import { Controller, Get, Post, Param, Body, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/utils/guards/admin.guard';
import { FindCategoryPostsDto } from './dto/find-category-posts.dto';
import { NullableType } from 'src/utils/types/nullable.type';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async create(@Body() category: Category): Promise<Category> {
        return this.categoryService.create(category);
    }

    @Get()
    async findAll(): Promise<{ categories: NullableType<Category[]> }> {
        return this.categoryService.findAll();
    }

    @Get('/public/:id')
    async findOneByPublic(
        @Param('id') id: string,
        @Query() findCategoryPosts: FindCategoryPostsDto
    ): Promise<Category> {
        return this.categoryService.findOne(+id, findCategoryPosts);
    }

    @Get('/:id')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async findOne(@Param('id') id: string, @Query() findCategoryPostsDto: FindCategoryPostsDto): Promise<Category> {
        return this.categoryService.findOne(+id, findCategoryPostsDto, true);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        return this.categoryService.update(+id, updateCategoryDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async delete(@Param('id') id: string): Promise<void> {
        return this.categoryService.remove(+id);
    }
}
