import {
    Injectable,
    UnprocessableEntityException,
    NotFoundException,
} from '@nestjs/common';
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
import { NullableType } from 'src/utils/types/nullable.type';
import { LoginResponseType } from './types/login-response.type';
import { SocialInterface } from 'src/social/social.interface';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService,
        private mailService: MailService,
        private configService: ConfigService<AllConfigType>,
    ) {}

    async generateAccessToken(payload: any) {
        const token = await this.jwtService.signAsync(payload);
        // const expirationDate = this.getExpirationDateFromToken(token);
        // console.log('Token expiration in Korean Timezone:', expirationDate.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }));
        return token;
    }

    async generateRefreshToken(payload: any) {
        return this.jwtService.sign(payload, {
            secret: this.configService.get('auth.refreshSecret', {
                infer: true,
            }),
            expiresIn: this.configService.get('auth.refreshExpires', {
                infer: true,
            }),
        });
    }

    private getExpirationDateFromToken(token: string): Date {
        const decodedToken: any = this.jwtService.decode(token, { json: true });
        if (decodedToken && decodedToken.exp) {
            return new Date(decodedToken.exp * 1000);
        }
        throw new Error('Cannot extract expiration date from token');
    }

    async generateHash(email: string): Promise<string> {
        const payload = {
            email,
        };
        const hash = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('auth.confirmEmailSecret', {
                infer: true,
            }),
            expiresIn: this.configService.get('auth.emailExpires', {
                infer: true,
            }),
        });

        return hash;
    }

    async register(registerDto: AuthRegisterDto): Promise<User> {
        const { email, userId, nickname } = registerDto;
        const existingEmail = await this.usersService.findOne({
            where: { email },
        });
        const existingUserId = await this.usersService.findOne({
            where: { userId },
        });
        const existingNickname = await this.usersService.findOne({
            where: { nickname },
        });
        const existingFields: any = [];
        if (existingEmail) {
            existingFields.push({
                field: 'email',
                message: '이미 존재하는 이메일 입니다.',
            });
        }

        if (existingUserId) {
            existingFields.push({
                field: 'userId',
                message: '이미 존재하는 아이디 입니다.',
            });
        }

        if (existingNickname) {
            existingFields.push({
                field: 'nickname',
                message: '이미 존재하는 닉네임 입니다.',
            });
        }
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
                secret: this.configService.getOrThrow(
                    'auth.confirmEmailSecret',
                    {
                        infer: true,
                    },
                ),
            });
            email = jwtData.email;
        } catch {
            throw new UnprocessableEntityException(
                '처리할 수 없는 요청입니다.',
            );
        }
        return { email };
    }

    async login(authLoginDto: AuthLoginDto): Promise<AuthLoginResponseDto> {
        const { hash } = authLoginDto;
        const { email } = await this.decodeEmail(hash);
        const user = await this.usersService.findOne({
            where: {
                email,
            },
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
            refreshToken,
        };
    }
    // https://velog.io/@mainfn/Node.js-express%EB%A1%9C-%EA%B5%AC%EA%B8%80-OAuth-%ED%9A%8C%EC%9B%90%EA%B0%80%EC%9E%85%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EA%B5%AC%ED%98%84
    // https://yoyostudy.tistory.com/43 프론트엔드

    async validateSocialLogin(
        authProvider: string,
        socialData: SocialInterface,
    ): Promise<LoginResponseType> {
        let user: NullableType<User> = null;
        const socialEmail = socialData.email?.toLowerCase();
        let userByEmail: NullableType<User> = null;

        // 이미 존재하는 이메일이라면
        if (socialEmail) {
            userByEmail = await this.usersService.findOne({
                where: {
                    email: socialEmail,
                },
            });
        }

        if (socialData.id) {
            user = await this.usersService.findOne({
                where: {
                    userId: socialData.id,
                },
            });
        }

        if (user) {
            if (socialEmail && !userByEmail) {
                user.email = socialEmail;
            }
            await this.usersService.update(user.id, user);
        } else if (userByEmail) {
            user = userByEmail;
        } else {
            // const role = {
            //     id: UsersRole.USER,
            // };
            // user = await this.usersService.create({
            //     email: socialEmail ?? null,
            //     firstName: socialData.firstName ?? null,
            //     lastName: socialData.lastName ?? null,
            //     socialId: socialData.id,
            //     provider: authProvider,
            //     role,
            //     status,
            // });
            // user = await this.usersService.findOne({
            //     id: user?.id,
            // });
        }

        // if (!user) {
        //     throw new HttpException(
        //         {
        //             status: HttpStatus.UNPROCESSABLE_ENTITY,
        //             errors: {
        //                 user: 'userNotFound',
        //             },
        //         },
        //         HttpStatus.UNPROCESSABLE_ENTITY,
        //     );
        // }

        // const session = await this.sessionService.create({
        //     user,
        // });

        // const {
        //     token: jwtToken,
        //     refreshToken,
        //     tokenExpires,
        // } = await this.getTokensData({
        //     id: user.id,
        //     role: user.role,
        //     sessionId: session.id,
        // });

        // return {
        //     refreshToken,
        //     token: jwtToken,
        //     tokenExpires,
        //     user,
        // };
        return {
            accessToken: '',
            refreshToken: '',
        };
    }

    // 프론트엔드에서 로그인 이메일인지 회원가입 이메일인지 알아야함
    async sendAuthEmail(
        authEmailDto: AuthEmailDto,
    ): Promise<{ message: string }> {
        const { email } = authEmailDto;
        const user = await this.usersService.findOne({
            where: {
                email,
            },
        });
        const hash = await this.generateHash(email);
        let message;
        if (!user) {
            await this.mailService.sendRegisterEmail({
                to: email,
                data: {
                    hash,
                },
            });
            message = '회원가입 링크가 이메일로 전송되었습니다.';
        } else {
            await this.mailService.sendLoginEmail({
                to: email,
                data: {
                    hash,
                },
            });
            message = '로그인 링크가 이메일로 전송되었습니다.';
        }

        return {
            message,
        };
    }
}
