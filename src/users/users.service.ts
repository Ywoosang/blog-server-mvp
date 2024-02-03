import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { NullableType } from 'src/utils/types/nullable.type';
import { FindOneOptions } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { GravatarService } from 'src/gravatar/gravatar.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private gravatarService: GravatarService
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { email } = createUserDto;
        const profileImage = this.gravatarService.getGravatarUrl(email);
        return this.usersRepository.save(
            this.usersRepository.create({
                ...createUserDto,
                profileImage
            })
        );
    }

    async findOne(findOptions: FindOneOptions<User>): Promise<NullableType<User>> {
        return await this.usersRepository.findOne(findOptions);
    }

    async findAll() {
        return this.usersRepository.find();
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        const user = await this.findOne({
            where: {
                id
            }
        });

        return this.usersRepository.save({
            ...user,
            ...updateUserDto
        });
    }

    async updateRefreshToken(id: number, refreshToken: string): Promise<void> {
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.usersRepository.update(id, {
            refreshToken: hashedRefreshToken
        });
    }
}
