import {
    Injectable,
    CanActivate,
    ExecutionContext
} from '@nestjs/common';
import { LikeService } from './like.service';

@Injectable()
export class LikeExistGuard implements CanActivate {
    constructor(private likeService: LikeService) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const postId = request.params.postId;
        const userId = request.user.id;
        const like = await this.likeService.findOne({
            where: {
                post: {
                    id: postId,
                },
                user: {
                    id: userId
                }
            },
        });
        return !!!like;
    }
}