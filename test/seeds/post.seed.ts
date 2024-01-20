import * as faker from 'faker';
import { PostStatus } from 'src/post/post-status.enum';
import { PostService } from 'src/post/post.service';
import { User } from 'src/users/entities/user.entity';
import { CreatePostDto } from 'src/post/dto/create-post.dto';

class PostSeeder {
    constructor(private readonly postService: PostService) {}

    async createTestPost(user: User, status: PostStatus = PostStatus.PUBLIC, categoryId?: number, tagNames?: string[]) {
        const post: CreatePostDto = {
            title: faker.lorem.sentence(),
            content: faker.lorem.paragraph(),
            description: '',
            status,
            categoryId,
            tagNames
        };

        await this.postService.create(post, user);
    }
}

export default PostSeeder;
