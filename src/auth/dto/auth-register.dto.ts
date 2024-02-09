import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class AuthRegisterDto {
    @IsNotEmpty()
    @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    email: string;

    // 4~15자 영문 또는 숫자
    @IsString()
    @Matches(/^[a-zA-Z0-9]{4,10}$/)
    userLoginId: string;

    // 2~10자 영문 또는 한글 또는 숫자
    @IsString()
    @Matches(/^[a-zA-Z가-힣0-9]{2,10}$/)
    nickname: string;

    // 6~15자 영문, 숫자, 특수문자(@!) 각각 적어도 하나씩 포함
    @IsString()
    @Matches(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[@!])[a-zA-Z0-9@!]{6,15}$/)
    password: string;
}
