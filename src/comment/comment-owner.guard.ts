import {
    Injectable,
    CanActivate,
    ExecutionContext,
    NotFoundException,
} from '@nestjs/common';
import { CommentService } from './comment.service';

@Injectable()
export class CommentOwnerGuard implements CanActivate {
    constructor(private commentService: CommentService) {}

    canActivate(ctx: ExecutionContext): Promise<boolean> {
        const req = ctx.switchToHttp().getRequest();
        const id = req.params.id;
        const userId = req.user.id;

        return this.isCommentOwner(id, userId);
    }

    async isCommentOwner(id: number, userId: number): Promise<boolean> {
        const comment = await this.commentService.findOne({
            where: {
                id,
            },
            relations: ['user'],
        });
        if (!comment) throw new NotFoundException();
        const commentOwnerId = comment.user.id;

        // 사용자가 게시물 주인인지 확인
        return userId == commentOwnerId;
    }
}
