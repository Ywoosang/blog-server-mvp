import { Post } from '../entities/post.entity';

export class FindPostsResponseDto {
    posts: Post[];
    total: number;
}
