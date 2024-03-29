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
import { FindUserActivitiesDto } from './dto/find-user-activities.dto';
import { Comment } from 'src/comment/entities/comment.entity';
import ActivityResponse from './dto/activity-response.dto';
import { POST_PER_PAGE } from 'src/common/consts';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Comment)
        private commentRepository: Repository<Comment>,
        private gravatarService: GravatarService,
        private filesService: FilesService,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { email } = createUserDto;
        const profileImage = this.gravatarService.getGravatarUrl(email);

        return this.usersRepository.save(
            this.usersRepository.create({
                ...createUserDto,
                description: '',
                profileImage,
            }),
        );
    }

    async findOne(findOptions: FindOneOptions<User>): Promise<NullableType<User>> {
        return this.usersRepository.findOne(findOptions);
    }

    async findAll() {
        return this.usersRepository.find();
    }

    async findUserPublicProfileByUserId(userId: string) {
        const user = await this.usersRepository
            .createQueryBuilder('user')
            .select(['user.id', 'user.userId', 'user.nickname', 'user.profileImage', 'user.description'])
            .where('user.userId = :userId', { userId })
            .getOne();
        if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

        return user;
    }

    async findUserActivities(findUserActivitiesDto: FindUserActivitiesDto, userId: string): Promise<ActivityResponse> {
        // 활동내역
        // 댓글 작성 일자
        let { page, limit } = findUserActivitiesDto;
        page = page ? page : 1;
        limit = limit ? limit : POST_PER_PAGE;
        const skip = (page - 1) * limit;
        const [comments, total] = await this.commentRepository
            .createQueryBuilder('comment')
            .innerJoin('comment.user', 'user')
            .innerJoinAndSelect('comment.post', 'post')
            .select(['comment.id', 'comment.createdAt', 'post.title', 'post.id'])
            .where('user.userId = :userId', { userId })
            // .orderBy('comment.createdAt', 'DESC')
            .offset(skip)
            .limit(limit)
            .getManyAndCount();
        return {
            comments,
            total,
        };
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        const user = await this.findOne({
            where: {
                id,
            },
        });
        // 프로필 이미지가 변경되었을 경우
        if (!user) {
            throw new NotFoundException('사용자가 존재하지 않습니다.');
        }
        const { profileImage } = updateUserDto;
        if (profileImage && user.profileImage != profileImage) {
            const filename = path.basename(profileImage);
            updateUserDto.profileImage = await this.filesService.uploadUserProfileImage(filename);
        }

        return this.usersRepository.save({
            ...user,
            ...updateUserDto,
        });
    }

    async updateRefreshToken(id: number, refreshToken: string): Promise<void> {
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.usersRepository.update(id, {
            refreshToken: hashedRefreshToken,
        });
    }
}
