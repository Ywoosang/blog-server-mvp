import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PostStatus } from '../post-status.enum';

export class CreatePostDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    content: string;

    @IsString()
    description: string;

    @IsEnum(PostStatus)
    status: PostStatus;

    @IsOptional()
    @IsNotEmpty()
    categoryId?: number;

    @IsOptional()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    tagNames?: string[];

    @IsOptional()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    fileNames?: string[];
}
