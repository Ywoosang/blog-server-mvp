import { IsNotEmpty, Length } from 'class-validator';

export class CreateReplyDto {
    @IsNotEmpty()
    @Length(0, 20000)
    content: string;

    @IsNotEmpty()
    replyToId: number;
}
