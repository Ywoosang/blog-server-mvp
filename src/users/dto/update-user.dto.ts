import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(10)
    nickname?: string;

    @IsOptional()
    @IsString()
    description?: string;
}
