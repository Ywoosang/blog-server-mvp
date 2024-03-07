import { IsNotEmpty, Length } from 'class-validator';

export class UpdateCommentDto {
    @IsNotEmpty()
    @Length(0, 20000)
    content: string;
}
