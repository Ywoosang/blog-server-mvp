import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @Matches(/^.{2,10}$/)
    nickname: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    description?: string;

    @IsOptional()
    @IsString()
    profileImage?: string;
}
