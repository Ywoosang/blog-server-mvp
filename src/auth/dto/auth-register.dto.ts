import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class AuthRegisterDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    // 4~15자 영문 또는 숫자
    @IsString()
    @Matches(/^[a-zA-Z0-9]{4,10}$/)
    userId: string;

    // 2~10자 영문 또는 한글 또는 숫자
    @IsString()
    @Matches(/^[a-zA-Z가-힣0-9]{2,10}$/)
    nickname: string;

    @IsString()
    description: string;
}
