import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class AuthLoginDto {
    @IsNotEmpty()
    @IsString()
    hash: string;
}