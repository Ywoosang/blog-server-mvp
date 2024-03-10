import {
    Injectable,
    CanActivate,
    ExecutionContext,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PostService } from '../post.service';

@Injectable()
export class PostExistGuard implements CanActivate {
    constructor(private postService: PostService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const postId = request.params.id;
        if (isNaN(postId))
            throw new BadRequestException('올바르지 않은 요청입니다.');
        const post = await this.postService.findOne({
            where: {
                id: postId,
            },
        });
        if (!post) {
            throw new NotFoundException('게시물을 찾을 수 없습니다.');
        }

        return true;
    }
}
