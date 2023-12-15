import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/configs/types/config.type';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService<AllConfigType>) => ({
                secret: configService.get('auth.secret', { infer: true }),
                signOptions: {
                    expiresIn: configService.get('auth.expires', { infer: true })
                }
            }),
            inject: [ConfigService]
        }),
        TypeOrmModule.forFeature([User]),
        UsersModule
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, UsersService],
    exports: [JwtStrategy]
})
export class AuthModule {}
