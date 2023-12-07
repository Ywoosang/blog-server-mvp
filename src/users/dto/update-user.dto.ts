import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
    @IsString()
    @MinLength(2)
    @MaxLength(10)
    nickname: string;

    @IsOptional()
    description: string;
}
