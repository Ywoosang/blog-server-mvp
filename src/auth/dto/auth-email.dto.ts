import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class AuthEmailDto {
    @IsNotEmpty()
    @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    email: string;
}