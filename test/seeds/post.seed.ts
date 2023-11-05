import { PostStatus } from 'src/post/post-status.enum';
import { PostService } from 'src/post/post.service';
import { User } from 'src/users/entities/user.entity';
import { CreatePostDto } from 'src/post/dto/create-post.dto';

class PostSeeder {
    constructor(private postService: PostService) {}

    async createTestPosts(
        user: User,
		count: number,
        status: PostStatus
	) {        
        const userPromises = Array.from({ length: count }, async (_, i) => {
            const post: CreatePostDto   = {
                title: `테스트 제목${i}`,
                content: `테스트 내용${i}`,
                status
            }
            return this.postService.create(post,user);
        });
        return Promise.all(userPromises);
    }

    async createTestPost(
        user: User,
        status: PostStatus
    ) {
        const post: CreatePostDto = {
            title: `테스트 제목`,
            content: '테스트 내용',
            status
        }
        await this.postService.create(post,user);
    }
}

export default PostSeeder;