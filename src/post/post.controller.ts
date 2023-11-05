import { 
	Body, 	
	Param, 
	Controller, 
	Get, 
	Post,
	Delete, 
	Patch, 
	UsePipes, 
	ParseIntPipe, 
	ValidationPipe,
	Query,
	UseGuards,
	HttpCode,
  	HttpStatus
} from '@nestjs/common';
import { PostStatus } from './post-status.enum';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostStatusValidationPipe } from './pipes/post-status-validation.pipe';
import { Post as PostEntity } from './entities/post.entity'
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { GetUser } from 'src/auth/get-user.decorator';
import { PaginationResponseDto } from './dto/pagination-response.dto';
import { PostOwnerGuard } from './post-owner.guard';
import { PublicPostGuard } from './public-post.guard';
import { BlogOwnerGuard } from './blog-owner.guard';

@Controller('posts')
export class PostController {
    constructor(
		private postService: PostService
	) { }

	/**
	 * Creates a new post.
	 *
	 * @param createPostDto - The data to create the post.
	 * @param user - The authenticated user creating the post.
	 * @returns The newly created post.
	 */
	@Post()
	@UseGuards(AuthGuard('jwt'))
	@UsePipes(ValidationPipe)
	@HttpCode(HttpStatus.CREATED)
	async createPost(
		@Body() createPostDto: CreatePostDto,
		@GetUser() user: User
	): Promise<PostEntity> {
		return this.postService.create(createPostDto, user);
	}

	/**
	 * Retrieves all public posts with pagination.
	 *
	 * @param page - The page number for pagination.
	 * @returns A paginated list of public posts.
	 */
	@Get('/public')
	@HttpCode(HttpStatus.OK)
	getPublicPosts(
		@Query('page') page: number = 1
	) : Promise<PaginationResponseDto> {
		return  this.postService.findPublicPosts(page);	
	}

	/**
	 * Retrieves public posts of a user or another user.
	 *
	 * @param userId - The ID of the user to retrieve posts for.
	 * @returns A list of public posts.
	 */
	@Get('/public/user/:userId')
	@HttpCode(HttpStatus.OK)
	async getUserPublicPosts(
		@Param('userId',ParseIntPipe) userId: number,
	): Promise<PostEntity[]> {		 
		return this.postService.findPublicUserPosts(userId);
	}

	/**
	 * Retrieves a public post by its ID.
	 *
	 * @param postId - The ID of the post to retrieve.
	 * @returns The requested public post.
	 */
	@Get('/public/:id')
	@UseGuards(PublicPostGuard)
	@HttpCode(HttpStatus.OK)
	async getPublicPostById(@Param('id',ParseIntPipe) postId: number): Promise<PostEntity> {
		return this.postService.findOne({
			where: {
				id: postId
			}
		})
	}

	/**
	 * Retrieves a user's posts.
	 *
	 * @param user - The authenticated user making the request.
	 * @returns A list of the user's posts.
	 */
	@Get('/user/:userId')
	@UseGuards(AuthGuard('jwt'), BlogOwnerGuard)
	@HttpCode(HttpStatus.OK)
	async getUserPosts(
		@GetUser() user: User
	): Promise<PostEntity[]> {
		return this.postService.findUserPosts(user);
	}

	/**
	 * Retrieves a user's post by its ID.
	 *
	 * @param postId - The ID of the post to retrieve.
	 * @param user - The authenticated user making the request.
	 * @returns The requested user's post.
	 */
	@Get('/:id')
	@UseGuards(AuthGuard('jwt'))
	@HttpCode(HttpStatus.OK)
	async getPostById(	 
		@Param('id') postId: number,
		@GetUser() user: User
	): Promise<PostEntity> {
		return this.postService.findUserPost(postId, user);
	}

	/**
	 * Updates the status of a post.
	 *
	 * @param postId - The ID of the post to update.
	 * @param status - The new status for the post.
	 * @returns No content (204) on a successful update.
	 */
	@Patch("/:id/status")
	@UseGuards(AuthGuard('jwt'),PostOwnerGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	async updatePostStatus(
		@Param('id', ParseIntPipe) postId: number, 
	    @Body('status', PostStatusValidationPipe) status: PostStatus
	) {
		return this.postService.updateStatus(postId, status);
	}

	/**
	 * Deletes a post.
	 *
	 * @param postId - The ID of the post to delete.
	 * @param user - The authenticated user making the request.
	 * @returns No content (204) on a successful deletion.
	 */	 
	@Delete('/:id')
	@UseGuards(AuthGuard('jwt'),PostOwnerGuard)
	@HttpCode(HttpStatus.OK)
	async deletePost(
		@Param('id', ParseIntPipe) postId: number,
		@GetUser() user: User
	): Promise<void> {
		return this.postService.delete(postId, user);
	}
}
