import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthLoginResponseDto } from './dto/auth-login-response.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersRole } from 'src/users/users-role.enum';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/configs/types/config.type';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private userService: UsersService,
        private configService: ConfigService<AllConfigType>
    ) {}

    async generateAccessToken(payload: any) {
        return this.jwtService.signAsync(payload);
    }

    async generateRefreshToken(payload: any) {
        return this.jwtService.sign(payload, {
            secret: this.configService.get('auth.refreshSecret', { infer: true }),
            expiresIn: this.configService.get('auth.refreshExpires', { infer: true })
        });
    }

    async signUp(registerDto: AuthRegisterDto): Promise<User> {
        const { email, userLoginId } = registerDto;
        const existUser = await this.userService.findOne({
            where: [{ email }, { userLoginId }]
        });
        if (existUser) throw new ConflictException('이미 존재하는 사용자입니다.');
        const createUserDto: CreateUserDto = {
            ...registerDto,
            role: UsersRole.USER
        };

        return this.userService.create(createUserDto);
    }

    async signIn(loginDto: AuthLoginDto): Promise<AuthLoginResponseDto> {
        const { userLoginId, password } = loginDto;
        const user = await this.userService.findOne({
            where: {
                userLoginId
            }
        });
        if (!user) {
            throw new UnauthorizedException('해당 아이디를 가진 사용자가 존재하지 않습니다.');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new UnauthorizedException('비밀번호가 틀렸습니다.');
        }

        const payload = { userLoginId };
        const accessToken = await this.generateAccessToken(payload);
        const refreshToken = await this.generateRefreshToken(payload);
        await this.userService.updateRefreshToken(user.id, refreshToken);

        return {
            accessToken,
            refreshToken
        };
    }
}
