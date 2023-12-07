import { IsAlphanumeric, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class AuthLoginDto {
    @IsAlphanumeric()
    @MinLength(4)
    @MaxLength(20)
    userLoginId: string;

    @IsString()
    @MinLength(6)
    @MaxLength(15)
    @Matches(/^[a-zA-Z0-9!@]*$/)
    password: string;
}
