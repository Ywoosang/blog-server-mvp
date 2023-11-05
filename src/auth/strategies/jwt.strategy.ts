import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {
        super({
			// 토큰이 유효한지 체크 
            secretOrKey: 'secret',
            // bearer 
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() 
        })
    }

    async validate(payload: any) {
        const { userLoginId } = payload;
        const user: User = await this.userRepository.findOne({
            where: {
                userLoginId
            }
        })
        if(!user) throw new UnauthorizedException();
        return user;
    }
}