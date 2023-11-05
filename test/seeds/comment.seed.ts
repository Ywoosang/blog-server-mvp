 
import { CommentService } from 'src/comment/comment.service';
import { User } from 'src/users/entities/user.entity';
import { CreateCommentDto } from 'src/comment/dto/create-comment.dto';
import { CreateReplyDto } from 'src/comment/dto/create-reply.dto';

class CommentSeeder {
    constructor(private commentService: CommentService) {}

    async createTestComment(
        user: User,
	) {        
        const comment: CreateCommentDto = {
            content: '테스트 댓글',
            postId: 1
        }
        await this.commentService.create(comment,user);
    }

    async createTestReply(
        user: User,
        parentCommentId: number
    ) {
        const reply: CreateReplyDto = {
            content: '테스트 대댓글'
        }
        await this.commentService.createReply(reply,parentCommentId, user);
    }
}

export default CommentSeeder;