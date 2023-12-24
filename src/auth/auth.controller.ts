import { Body, Controller, Post, ValidationPipe, HttpCode, HttpStatus, UseGuards, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { User } from 'src/users/entities/user.entity';
import { NullableType } from 'src/utils/types/nullable.type';
import { AuthLoginResponseDto } from './dto/auth-login-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/utils/decorators/get-user.decorator';
import { ConfirmEmailDto } from './dto/auth-confirm-email.dto';
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    /**
     * 새로운 사용자를 등록한다
     *
     * @param registerDto - 사용자 등록을 위한 데이터
     * @returns 생성된 사용자 계정
     */
    @Post('/signup')
    @HttpCode(HttpStatus.CREATED)
    signUp(@Body(ValidationPipe) registerDto: AuthRegisterDto): Promise<NullableType<User>> {
        return this.authService.signUp(registerDto);
    }

    /**
     * 사용자 로그인을 처리한다
     *
     * @param loginDto - 로그인을 위한 데이터
     * @returns 로그인 후의 응답 데이터
     */
    @Post('/signin')
    @HttpCode(HttpStatus.OK)
    signIn(@Body(ValidationPipe) loginDto: AuthLoginDto): Promise<AuthLoginResponseDto> {
        return this.authService.signIn(loginDto);
    }

    /**
     * 이메일을 전송한다
     *
     * @param user - 현재 사용자 정보
     * @returns 전송된 사용자 정보
     */
    @Post('/send-email')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.NO_CONTENT)
    async sendEmail(@GetUser() user: User): Promise<User> {
        return this.authService.sendEmail(user);
    }

    /**
     * 이메일 확인을 처리한다
     *
     * @param confirmEmailDto - 이메일 확인을 위한 데이터
     * @returns 없음
     */
    @Get('/confirm-email')
    @HttpCode(HttpStatus.NO_CONTENT)
    async confirmEmail(@Query() confirmEmailDto: ConfirmEmailDto): Promise<void> {
        return this.authService.confirmEmail(confirmEmailDto.hash);
    }

    /**
     * 액세스 토큰을 새로고침한다
     *
     * @param user - 현재 사용자 정보
     * @returns 새로 생성된 액세스 토큰
     */
    @Get('/refresh')
    @UseGuards(AuthGuard('jwt-refresh'))
    @HttpCode(HttpStatus.OK)
    async refresh(@GetUser() user: User) {
        const payload = { userLoginId: user.userLoginId };
        const accessToken = await this.authService.generateAccessToken(payload);

        return {
            accessToken
        };
    }
}
