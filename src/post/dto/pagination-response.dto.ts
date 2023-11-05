import { Post } from '../entities/post.entity';

export class PaginationResponseDto {
    posts: Post[];
    total: number;
}