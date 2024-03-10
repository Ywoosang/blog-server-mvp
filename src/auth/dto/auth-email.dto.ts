import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthEmailDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;
}
