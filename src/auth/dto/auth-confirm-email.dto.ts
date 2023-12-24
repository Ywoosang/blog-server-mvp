import { IsNotEmpty } from 'class-validator';

export class ConfirmEmailDto {
    @IsNotEmpty()
    hash: string;
}
