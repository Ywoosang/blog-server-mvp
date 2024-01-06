import { Controller, Get, Post, Param, Body, Put, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/utils/guards/admin.guard';
import { FindCategoryPostsDto } from './dto/find-category-posts.dto';
import { NullableType } from 'src/utils/types/nullable.type';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
        return this.categoryService.create(createCategoryDto);
    }

    @Get()
    async findAll(): Promise<{ categories: NullableType<Category[]> }> {
        return this.categoryService.findAll();
    }

    @Get('/public/:id')
    async findOneWithPostsByPublic(
        @Param('id', ParseIntPipe) id: number,
        @Query() findCategoryPostsDto: FindCategoryPostsDto
    ): Promise<Category> {
        return this.categoryService.findOneWithPosts(+id, findCategoryPostsDto);
    }

    @Get('/:id')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async findOneWithPosts(
        @Param('id', ParseIntPipe) id: number,
        @Query() findCategoryPostsDto: FindCategoryPostsDto
    ): Promise<Category> {
        return this.categoryService.findOneWithPosts(+id, findCategoryPostsDto, true);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCategoryDto: UpdateCategoryDto
    ): Promise<Category> {
        return this.categoryService.update(+id, updateCategoryDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.categoryService.remove(+id);
    }
}
