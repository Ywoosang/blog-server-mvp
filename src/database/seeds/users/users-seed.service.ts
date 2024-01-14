import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRole } from 'src/users/users-role.enum';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { UsersStatus } from 'src/users/users-status.enum';

@Injectable()
export class UsersSeedService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>
    ) {}

    async run() {
        const countAdmin = await this.usersRepository.count({
            where: { role: UsersRole.ADMIN }
        });
        if (!countAdmin) {
            await this.usersRepository.save(
                this.usersRepository.create({
                    email: process.env.ADMIN_EMAIL,
                    userLoginId: process.env.ADMIN_LOGIN_ID,
                    nickname: process.env.ADMIN_NICKNAME,
                    description: process.env.ADMIN_DESCRIPTION,
                    password: process.env.ADMIN_PASSWORD,
                    role: UsersRole.ADMIN,
                    status: UsersStatus.ACTIVE
                })
            );
        }
    }
}
