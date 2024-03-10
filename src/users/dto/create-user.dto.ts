import {
    IsAlphanumeric,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';
import { UsersRole } from '../users-role.enum';

export class CreateUserDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsAlphanumeric()
    @MinLength(4)
    @MaxLength(20)
    userId: string;

    @IsString()
    @MinLength(2)
    @MaxLength(10)
    nickname: string;

    @IsEnum(UsersRole)
    role: UsersRole;
}
