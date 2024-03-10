import { Comment } from 'src/comment/entities/comment.entity';

export default interface ActivityResponse {
    comments: Comment[];
    total: number;
}
