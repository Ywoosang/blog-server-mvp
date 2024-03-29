import { IsEmail, IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';
import { UsersRole } from '../users-role.enum';

export class CreateUserDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @Matches(/^[a-zA-Z0-9]{4,10}$/)
    userId: string;

    // 2~10자
    @IsString()
    @Matches(/^.{2,10}$/)
    nickname: string;

    @IsEnum(UsersRole)
    role: UsersRole;
}
