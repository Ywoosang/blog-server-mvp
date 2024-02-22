import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PostStatus } from '../post-status.enum';

export class UpdatePostDto {
    @IsOptional()
    @IsString()
    title: string;

    @IsOptional()
    @IsNotEmpty()
    content: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
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
