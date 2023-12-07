import { IsNotEmpty } from 'class-validator';

export class AuthLoginResponseDto {
    @IsNotEmpty()
    accessToken: string;
}
