import { IsNotEmpty, Length } from 'class-validator';

export class CreateCommentDto {
    @IsNotEmpty()
    @Length(0, 20000)
    content: string;

    @IsNotEmpty()
    postId: number;
}
