import { 
    CanActivate, 
    ExecutionContext, 
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { PostService } from './post.service';
import { PostStatus } from './post-status.enum';

@Injectable()
export class PublicPostGuard implements CanActivate {
    constructor(private postService: PostService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean>  {
    const request = context.switchToHttp().getRequest();
    const postId = +request.params.id;  
    const post = await this.postService.findOne({
        where: { 
            id: postId 
        }
    });
    if(!post) throw new NotFoundException('존재하지 않는 게시물 입니다');
    return post.status === PostStatus.PUBLIC
  }
}