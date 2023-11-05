import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateCommentDto {
  @IsNotEmpty()
  content: string;
}