import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    FindOptionsWhere,
    FindManyOptions,
    Repository,
    FindOneOptions,
} from 'typeorm';
import { Like } from 'src/like/entities/like.entity';
import { NullableType } from 'src/utils/types/nullable.type';
import { PostService } from 'src/post/post.service';

@Injectable()
export class LikeService {
    constructor(
        @InjectRepository(Like)
        private likeRepository: Repository<Like>,
        private postService: PostService,
    ) {}

    async create(userId: number, postId: number): Promise<Like> {
        return this.likeRepository.save(
            this.likeRepository.create({
                user: {
                    id: userId,
                },
                post: {
                    id: postId,
                },
            }),
        );
    }

    async findOne(
        findOptions: FindOneOptions<Like>,
    ): Promise<NullableType<Like>> {
        return this.likeRepository.findOne(findOptions);
    }

    async findMany(findOptions: FindManyOptions<Like>) {
        return this.likeRepository.find(findOptions);
    }

    async delete(findOptions: FindOptionsWhere<Like>) {
        await this.likeRepository.delete(findOptions);
    }
}
