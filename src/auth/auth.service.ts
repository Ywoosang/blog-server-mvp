import { Injectable, UnprocessableEntityException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthLoginResponseDto } from './dto/auth-login-response.dto';
import { UsersRole } from 'src/users/users-role.enum';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/configs/types/config.type';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/users/entities/user.entity';
import AuthConflictException from 'src/common/exceptions/auth-conflict.exception';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthEmailDto } from './dto/auth-email.dto';

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

    async register(registerDto: AuthRegisterDto): Promise<User> {
        const { email, userId, nickname } = registerDto;
        const existingEmail = await this.usersService.findOne({ where: { email } });
        const existingUserId = await this.usersService.findOne({ where: { userId } });
        const existingNickname = await this.usersService.findOne({ where: { nickname } });
        const existingFields = [];
        if (existingEmail) {
            existingFields.push({
                field: 'email',
                message: '이미 존재하는 이메일 입니다.'
            });
        }

        if (existingUserId) {
            existingFields.push({
                field: 'userId',
                message: '이미 존재하는 아이디 입니다.'
            });
        }

        if (existingNickname) {
            existingFields.push({
                field: 'nickname',
                message: '이미 존재하는 닉네임 입니다.'
            });
        }
        console.log(existingFields);
        if (existingFields.length > 0) {
            throw new AuthConflictException(existingFields);
        }

        const user = await this.usersService.create({
            ...registerDto,
            role: UsersRole.USER,
        });

        return user;
    }

    async decodeEmail(hash: string): Promise<{ email: string }> {
        let email: string;
        try {
            const jwtData = await this.jwtService.verifyAsync<{
                email: User['email'];
            }>(hash, {
                secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
                    infer: true
                })
            });
            email = jwtData.email;
        } catch {
            throw new UnprocessableEntityException('invalid hash');
        }
        return { email };
    }

    async login(authLoginDto: AuthLoginDto): Promise<AuthLoginResponseDto> {
        const { hash } = authLoginDto;
        const { email } = await this.decodeEmail(hash);
        const user = await this.usersService.findOne({
            where: {
                email
            }
        });

        if (!user) {
            throw new NotFoundException('사용자를 찾을 수 없습니다.');
        }
        const payload = { userId: user.userId };
        const accessToken = await this.generateAccessToken(payload);
        const refreshToken = await this.generateRefreshToken(payload);
        await this.usersService.updateRefreshToken(user.id, refreshToken);

        return {
            accessToken,
            refreshToken
        };
    }




    // 프론트엔드에서 로그인 이메일인지 회원가입 이메일인지 알아야함
    async sendAuthEmail(authEmailDto: AuthEmailDto): Promise<{ message: string }> {
        const { email } = authEmailDto;
        console.log(email);
        const user = await this.usersService.findOne({
            where: {
                email
            }
        })
        console.log(user);
        const payload = {
            email
        };

        const hash = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('auth.confirmEmailSecret', {
                infer: true
            }),
            expiresIn: this.configService.get('auth.emailExpires', {
                infer: true
            })
        });
        let message;
        if (!user) {
            await this.mailService.sendRegisterEmail({
                to: email,
                data: {
                    hash
                }
            });
            message = '회원가입 링크가 이메일로 전송되었습니다.'
        } else {
            await this.mailService.sendLoginEmail({
                to: email,
                data: {
                    hash
                }
            })
            message = '로그인 링크가 이메일로 전송되었습니다.'
        }

        return {
            message
        }
    }
}
