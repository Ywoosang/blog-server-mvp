import { IsAlphanumeric, IsNotEmpty, IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class AuthRegisterDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsAlphanumeric()
    @MinLength(4)
    @MaxLength(20)
    userLoginId: string;

    @IsString()
    @MinLength(2)
    @MaxLength(10)
    nickname: string;

    @IsString()
    @MinLength(6)
    @MaxLength(15)
    @Matches(/^[a-zA-Z0-9!@]*$/, {
        message: 'password only accepts english and number'
    })
    password: string;
}
