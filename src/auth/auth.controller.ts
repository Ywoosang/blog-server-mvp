import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { User } from 'src/users/entities/user.entity';
import { NullableType } from 'src/utils/types/nullable.type';
import { AuthLoginResponseDto } from './dto/auth-login-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/utils/decorators/get-user.decorator';
import { ConfirmEmailDto } from './dto/auth-confirm-email.dto';
import { AuthEmailDto } from './dto/auth-email.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    /**
     * 새로운 사용자를 등록한다
     *
     * @param registerDto - 사용자 등록을 위한 데이터
     * @returns 생성된 사용자 계정
     */
    @Post('/register')
    @HttpCode(HttpStatus.CREATED)
    register(@Body() registerDto: AuthRegisterDto): Promise<NullableType<User>> {
        return this.authService.register(registerDto);
    }

    /**
     * 사용자 로그인을 처리한다
     *
     * @param loginDto - 로그인을 위한 데이터
     * @returns 로그인 후의 응답 데이터
     */
    @Post('/login')
    @HttpCode(HttpStatus.OK)
    login(@Body() loginDto: AuthLoginDto): Promise<AuthLoginResponseDto> {
        return this.authService.login(loginDto);
    }

    /**
     * 이메일을 전송한다
     *
     * @param user - 현재 사용자 정보
     * @returns 전송된 사용자 정보
     */
    @Post('/send-email')
    @HttpCode(HttpStatus.OK)
    async sendAuthEmail(@Body() authEmailDto: AuthEmailDto): Promise<{ message: string }> {
        return this.authService.sendAuthEmail(authEmailDto);
    }


    @Get('/email')
    @HttpCode(HttpStatus.OK)
    async findEmail(@Query('hash') hash: string): Promise<{ email: string }> {
        return this.authService.decodeEmail(hash);
    }

    /**
     * 액세스 토큰을 새로고침한다
     *
     * @param user - 현재 사용자 정보
     * @returns 새로 생성된 액세스 토큰
     */
    @Post('/refresh')
    @UseGuards(AuthGuard('jwt-refresh'))
    @HttpCode(HttpStatus.OK)
    async refresh(@GetUser() user: User) {
        const payload = { userId: user.userId };
        const accessToken = await this.authService.generateAccessToken(payload);

        return {
            accessToken
        };
    }
}
