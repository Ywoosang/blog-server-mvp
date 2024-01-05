import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PostStatus } from '../post-status.enum';

export class CreatePostDto {
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    content: string;

    @IsEnum(PostStatus)
    status: PostStatus;

    @IsOptional()
    @IsNotEmpty()
    categoryId?: number;

    @IsOptional()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    tagNames?: string[];
}
