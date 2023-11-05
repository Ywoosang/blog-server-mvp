import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateCommentDto {
    @IsNotEmpty()
	content: string;

    @IsNotEmpty()
    postId: number;
}