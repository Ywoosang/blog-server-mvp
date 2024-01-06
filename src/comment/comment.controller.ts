import {
    Controller,
    Post,
    Put,
    Get,
    Body,
    Delete,
    Param,
    UseGuards,
    ParseIntPipe,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthGuard } from '@nestjs/passport';
import { CommentOwnerGuard } from './comment-owner.guard';
import { User } from 'src/users/entities/user.entity';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { GetUser } from 'src/utils/decorators/get-user.decorator';

@Controller('comments')
export class CommentController {
    constructor(private commentService: CommentService) {}

    /**
     * Creates a new comment.
     *
     * @param createCommentDto - Data for creating a new comment.
     * @param user - The authenticated user creating the comment.
     * @returns The created comment.
     */
    @Post()
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.CREATED)
    async createComment(@Body() createCommentDto: CreateCommentDto, @GetUser() user: User): Promise<Comment> {
        return this.commentService.create(createCommentDto, user);
    }

    /**
     * Creates a new reply to a comment.
     *
     * @param parentCommentId - The ID of the parent comment to reply to.
     * @param createReplyDto - Data for creating a new reply.
     * @param user - The authenticated user creating the reply.
     * @returns The created reply.
     */
    @Post(':parentCommentId/replies')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.CREATED)
    async createReply(
        @Param('parentCommentId', ParseIntPipe) parentCommentId: number,
        @Body() createReplyDto: CreateReplyDto,
        @GetUser() user: User
    ): Promise<Comment> {
        return this.commentService.createReply(createReplyDto, parentCommentId, user);
    }

    /**
     * Retrieves comments for a specific post.
     *
     * @param postId - The ID of the post for which to retrieve comments.
     * @returns A list of comments for the specified post.
     */
    @Get('posts/:postId')
    @HttpCode(HttpStatus.OK)
    async getCommentsByPostId(@Param('postId', ParseIntPipe) postId: number): Promise<Comment[]> {
        return this.commentService.findMany(postId);
    }

    /**
     * Updates an existing comment.
     *
     * @param id - The ID of the comment to update.
     * @param updateCommentDto - Data for updating the comment.
     * @param user - The authenticated user updating the comment.
     * @returns The updated comment.
     */
    @Put(':id')
    @UseGuards(AuthGuard('jwt'), CommentOwnerGuard)
    async updateComment(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCommentDto: UpdateCommentDto
    ): Promise<Comment> {
        return this.commentService.update(id, updateCommentDto);
    }

    /**
     * Deletes a specific comment.
     *
     * @param id - The ID of the comment to delete.
     */
    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), CommentOwnerGuard)
    async deleteComment(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.commentService.delete(id);
    }
}
