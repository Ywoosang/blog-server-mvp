import * as faker from 'faker';
import { CommentService } from 'src/comment/comment.service';
import { User } from 'src/users/entities/user.entity';
import { CreateCommentDto } from 'src/comment/dto/create-comment.dto';
import { CreateReplyDto } from 'src/comment/dto/create-reply.dto';
import { Comment } from 'src/comment/entities/comment.entity';

class CommentSeeder {
    constructor(private readonly commentService: CommentService) {}

    async createTestComment(user: User, postId: number): Promise<Comment> {
        const comment: CreateCommentDto = {
            content: faker.lorem.paragraph(),
            postId
        };

        return this.commentService.create(comment, user);
    }

    async createTestReply(user: User, parentCommentId: number): Promise<Comment> {
        const reply: CreateReplyDto = {
            content: faker.lorem.paragraph(),
            replyToId: user.id
        };

        return this.commentService.createReply(reply, parentCommentId, user);
    }
}

export default CommentSeeder;
