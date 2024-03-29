import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRole } from 'src/users/users-role.enum';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { GravatarService } from 'src/gravatar/gravatar.service';

@Injectable()
export class UsersSeedService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private gravatarService: GravatarService,
    ) {}

    async run() {
        const countAdmin = await this.usersRepository.count({
            where: { role: UsersRole.ADMIN },
        });
        if (!countAdmin) {
            await this.usersRepository.save(
                this.usersRepository.create({
                    email: process.env.ADMIN_EMAIL,
                    userId: process.env.ADMIN_LOGIN_ID,
                    nickname: process.env.ADMIN_NICKNAME,
                    description: process.env.ADMIN_DESCRIPTION,
                    role: UsersRole.ADMIN,
                    profileImage: this.gravatarService.getGravatarUrl(process.env.ADMIN_EMAIL!),
                }),
            );
        }
    }
}
