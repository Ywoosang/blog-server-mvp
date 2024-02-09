import { Injectable, UnauthorizedException, UnprocessableEntityException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthLoginResponseDto } from './dto/auth-login-response.dto';
import { UsersRole } from 'src/users/users-role.enum';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/configs/types/config.type';
import { UsersStatus } from 'src/users/users-status.enum';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/users/entities/user.entity';
import AuthConflictException from 'src/common/exceptions/auth-conflict.exception';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService,
        private mailService: MailService,
        private configService: ConfigService<AllConfigType>
    ) { }

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
        const { email, userLoginId, nickname } = registerDto;
        const existingEmail = await this.usersService.findOne({ where: { email } });
        const existingUserLoginId = await this.usersService.findOne({ where: { userLoginId } });
        const existingNickname = await this.usersService.findOne({ where: { nickname } });
        const existingFields = [];

        if (existingEmail) {
            existingFields.push({
                field: 'email',
                message: '이미 존재하는 이메일 입니다.'
            });
        }

        if (existingUserLoginId) {
            existingFields.push({
                field: 'userLoginId',
                message: '이미 존재하는 아이디 입니다.'
            });
        }

        if (existingNickname) {
            existingFields.push({
                field: 'nickname',
                message: '이미 존재하는 이메일 입니다.'
            });
        }

        if (existingFields.length > 0) {
            throw new AuthConflictException(existingFields);
        }

        const user = await this.usersService.create({
            ...registerDto,
            role: UsersRole.USER,
            status: UsersStatus.PENDING_VERIFICATION
        });

        return user;
    }

    async signIn(loginDto: AuthLoginDto): Promise<AuthLoginResponseDto> {
        const { userLoginId, password } = loginDto;
        const user = await this.usersService.findOne({
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
        await this.usersService.updateRefreshToken(user.id, refreshToken);

        return {
            accessToken,
            refreshToken
        };
    }

    async sendEmail(user: User): Promise<User> {
        const payload = {
            confirmEmailUserId: user.id
        };
        const hash = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('auth.confirmEmailSecret', {
                infer: true
            }),
            expiresIn: this.configService.get('auth.emailExpires', {
                infer: true
            })
        });

        await this.mailService.sendVerificationEmail({
            to: user.email,
            data: {
                hash
            }
        });

        return user;
    }

    async confirmEmail(hash: string): Promise<void> {
        let userId: User['id'];
        console.log(hash);
        try {
            const jwtData = await this.jwtService.verifyAsync<{
                confirmEmailUserId: User['id'];
            }>(hash, {
                secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
                    infer: true
                })
            });

            userId = jwtData.confirmEmailUserId;
        } catch {
            throw new UnprocessableEntityException('invalid hash');
        }

        const user = await this.usersService.findOne({
            where: {
                id: userId
            }
        });

        if (!user || user?.status !== UsersStatus.PENDING_VERIFICATION) {
            throw new NotFoundException('사용자를 찾을 수 없습니다.');
        }
        user.status = UsersStatus.ACTIVE;
        await user.save();
    }
}
