import { Body, Controller, Post, ValidationPipe, HttpCode, HttpStatus, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { User } from 'src/users/entities/user.entity';
import { NullableType } from 'src/utils/types/nullable.type';
import { AuthLoginResponseDto } from './dto/auth-login-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/utils/decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    /**
     * Sign up a new user.
     *
     * @param registerDto - Data for user registration.
     * @returns The created user account.
     */
    @Post('/signup')
    @HttpCode(HttpStatus.CREATED)
    signUp(@Body(ValidationPipe) registerDto: AuthRegisterDto): Promise<NullableType<User>> {
        return this.authService.signUp(registerDto);
    }

    /**
     * Sign in a user.
     *
     * @param loginDto - Data for user login.
     * @returns An authentication response for the signed-in user.
     */
    @Post('/signin')
    @HttpCode(HttpStatus.OK)
    signIn(@Body(ValidationPipe) loginDto: AuthLoginDto): Promise<AuthLoginResponseDto> {
        return this.authService.signIn(loginDto);
    }

    @Get('/refresh')
    @UseGuards(AuthGuard('jwt-refresh'))
    async refresh(@GetUser() user: User) {
        const payload = { userLoginId: user.userLoginId };
        const accessToken = await this.authService.generateAccessToken(payload);

        return {
            accessToken
        };
    }
}
