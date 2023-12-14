import { Post } from '../entities/post.entity';

export class FindPostsDto {
    posts: Post[];
    total: number;
}
