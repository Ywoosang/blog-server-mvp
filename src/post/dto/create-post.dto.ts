import { IsNotEmpty } from 'class-validator';
import { PostStatus } from '../post-status.enum';

export class CreatePostDto {
	@IsNotEmpty()
	title: string;
	
	@IsNotEmpty()
	content: string;

	@IsNotEmpty()
	status: PostStatus;
}