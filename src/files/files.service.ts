import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/configs/types/config.type';

@Injectable()
export abstract class FilesService {
    constructor(protected readonly configService: ConfigService<AllConfigType>) {}
    abstract movePostImage(filename: string, postId: string): Promise<void>;
    abstract uploadUserProfileImage(filename: string): Promise<string>;
    abstract deletePostImages(postId: string): Promise<void>;
}
