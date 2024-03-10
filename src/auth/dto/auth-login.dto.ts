import { IsNotEmpty, IsString } from 'class-validator';

export class AuthLoginDto {
    @IsNotEmpty()
    @IsString()
    hash: string;
}