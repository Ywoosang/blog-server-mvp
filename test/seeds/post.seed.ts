import { PostStatus } from 'src/post/post-status.enum';
import { PostService } from 'src/post/post.service';
import { User } from 'src/users/entities/user.entity';
import { CreatePostDto } from 'src/post/dto/create-post.dto';
import * as faker from 'faker';

class PostSeeder {
    constructor(private postService: PostService) {}

    async createTestPosts(count: number, user: User, status: PostStatus) {
        const userPromises = Array.from({ length: count }, async () => {
            const post: CreatePostDto = {
                title: faker.lorem.sentence(),
                content: faker.lorem.paragraph(),
                status
            };

            return this.postService.create(post, user);
        });

        return Promise.all(userPromises);
    }

    async createTestPost(user: User, status: PostStatus) {
        const post: CreatePostDto = {
            title: faker.lorem.sentence(),
            content: faker.lorem.paragraph(),
            status
        };
        await this.postService.create(post, user);
    }
}

export default PostSeeder;
