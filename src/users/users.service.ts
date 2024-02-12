import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { NullableType } from 'src/utils/types/nullable.type';
import { FindOneOptions } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { GravatarService } from 'src/gravatar/gravatar.service';
import { FilesService } from 'src/files/files.service';
import path from 'path';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private gravatarService: GravatarService,
        private filesService: FilesService
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { email } = createUserDto;
        const profileImage = this.gravatarService.getGravatarUrl(email);

        return this.usersRepository.save(
            this.usersRepository.create({
                ...createUserDto,
                description: '',
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

    async findUserPublicProfileByLoginId(userId: string) {
        const user = await this.usersRepository
            .createQueryBuilder('user')
            .select(['user.id', 'user.userId', 'user.nickname', 'user.profileImage', 'user.description'])
            .where('user.userId = :userId', { userId })
            .getOne();
        if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

        return user;
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        const user = await this.findOne({
            where: {
                id
            }
        });
        // 프로필 이미지가 변경되었을 경우
        const { profileImage } = updateUserDto;
        if (profileImage && user.profileImage != profileImage) {
            const filename = path.basename(profileImage);
            updateUserDto.profileImage = await this.filesService.uploadUserProfileImage(filename);
        }

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
