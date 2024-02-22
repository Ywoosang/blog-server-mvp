import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostService } from 'src/post/post.service';
import { Comment } from './entities/comment.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { FindOneOptions } from 'typeorm';
import { NullableType } from 'src/utils/types/nullable.type';

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(Comment)
        private commentRepository: Repository<Comment>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private postService: PostService
    ) { }

    async create(createCommentDto: CreateCommentDto, user: User): Promise<Comment> {
        const { postId } = createCommentDto;
        const post = await this.postService.findOne({
            where: {
                id: postId
            }
        });

        return this.commentRepository.save(
            this.commentRepository.create({
                ...createCommentDto,
                post, // 연결된 게시물
                user
            })
        );
    }

    async createReply(createReplyDto: CreateReplyDto, parentCommentId: number, user: User): Promise<Comment> {
        const { replyToId } = createReplyDto;
        const replyTo = await this.userRepository.findOne({
            where: {
                id: replyToId
            }
        });
        if (!replyTo) {
            throw new NotFoundException('존재하지 않는 사용자입니다.');
        }

        const parentComment = await this.findOne({
            where: {
                id: parentCommentId
            },
            relations: ['post']
        });
        if (!parentComment) throw new NotFoundException('존재하지 않는 댓글입니다.');
        const post = parentComment.post;

        return this.commentRepository.save(
            this.commentRepository.create({
                ...createReplyDto,
                user,
                replyTo,
                post,
                parentComment
            })
        );
    }

    async findOne(findOptions: FindOneOptions<Comment>): Promise<NullableType<Comment>> {
        return this.commentRepository.findOne(findOptions);
    }

    async findMany(postId: number): Promise<NullableType<Comment[]>> {
        const comments = [];
        const rootComments = await this.commentRepository
            .createQueryBuilder('comment')
            .leftJoinAndSelect('comment.user', 'user')
            .where('comment.parentCommentId IS NULL')
            .andWhere('comment.postId = :postId', { postId }) // 추가된 부분
            .orderBy('comment.createdAt', 'ASC')
            .select([
                'comment.id',
                'comment.content',
                'comment.createdAt',
                'user.id',
                'user.nickname',
                'user.userId',
                'user.profileImage'
            ])
            .getMany();

        for (let i = 0; i < rootComments.length; i++) {
            const rootComment = rootComments[i];
            const replies = await this.commentRepository
                .createQueryBuilder('comment')
                .leftJoinAndSelect('comment.user', 'user')
                .leftJoinAndSelect('comment.replyTo', 'replyTo')
                .where('comment.parentCommentId = :parentId', { parentId: rootComment.id })
                .andWhere('comment.postId = :postId', { postId }) // 추가된 부분
                .orderBy('comment.createdAt', 'ASC')
                .select([
                    'comment.parentCommentId',
                    'comment.id',
                    'comment.content',
                    'comment.createdAt',
                    'user.id',
                    'user.nickname',
                    'user.profileImage',
                    'user.userId',
                    'replyTo.id',
                    'replyTo.nickname',
                    'replyTo.userId'
                ])
                .getMany();
            rootComment.replies = replies;
            comments.push(rootComment);
        }

        return comments;
    }

    async update(id: number, updateCommentDto: UpdateCommentDto): Promise<Comment> {
        const { content } = updateCommentDto;
        const comment = await this.findOne({
            where: {
                id
            }
        });
        comment.content = content;

        return this.commentRepository.save(comment);
    }

    async delete(id: number): Promise<void> {
        const comment = await this.findOne({
            where: {
                id
            }
        });
        await this.commentRepository.remove(comment);
    }
}
