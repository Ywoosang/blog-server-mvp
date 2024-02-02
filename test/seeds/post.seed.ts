import * as faker from 'faker';
import { PostStatus } from 'src/post/post-status.enum';
import { PostService } from 'src/post/post.service';
import { User } from 'src/users/entities/user.entity';
import { CreatePostDto } from 'src/post/dto/create-post.dto';
import { Post } from 'src/post/entities/post.entity';

class PostSeeder {
    constructor(private readonly postService: PostService) {}

    async createTestPost(
        user: User,
        status: PostStatus = PostStatus.PUBLIC,
        categoryId?: number,
        tagNames?: string[]
    ): Promise<Post> {
        const createPostDto: CreatePostDto = {
            title: faker.lorem.sentence(),
            content: faker.lorem.paragraph(),
            description: '',
            status,
            categoryId,
            tagNames
        };

        const post = await this.postService.create(createPostDto, user);

        return post;
    }
}

export default PostSeeder;
