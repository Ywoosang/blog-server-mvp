import { 
    Injectable, 
    CanActivate, 
    ExecutionContext,
    NotFoundException 
} from '@nestjs/common';
import { PostService } from './post.service';

@Injectable()
export class PostOwnerGuard implements CanActivate {
    constructor(private postService: PostService) { }

    canActivate(ctx: ExecutionContext): Promise<boolean> {
		const req = ctx.switchToHttp().getRequest();
		const id = req.params.id;
		const userId = req.user.id;
		return this.isPostOwner(id, userId);
    }

    async isPostOwner(id: number, userId: number): Promise<boolean> {
        const post = await this.postService.findOne({
            where: {
                id
            },
            relations: ['user']
        });
        if(!post) throw new NotFoundException();
        const postOwnerId = post.user.id;
        return userId === postOwnerId;
    }
}