import { 
	Injectable, 
	ConflictException, 
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthLoginResponseDto } from './dto/auth-login-response.dto';

@Injectable()
export class AuthService {
	constructor(
		private jwtService: JwtService,
		private userService: UsersService
	) {}
	
	async signUp(registerDto: AuthRegisterDto): Promise<User> {
		const { email, userLoginId } = registerDto;
		const existUser = await this.userService.findOne({
			where: [
				{ email },
				{ userLoginId }
			]
		});
		if(existUser) throw new ConflictException('이미 존재하는 사용자입니다.');
		return this.userService.create(registerDto);
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
		const isValidatePassword = await bcrypt.compare(password, user.password); 
		if (!isValidatePassword) {
		  throw new UnauthorizedException('비밀번호가 틀렸습니다.');
		}
		const payload = { userLoginId };
		const accessToken = await this.jwtService.signAsync(payload);
		return { accessToken };
	}
}
