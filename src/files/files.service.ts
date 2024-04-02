import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type AllConfigType } from 'src/configs/types/config.type';
import * as fs from 'fs';
import path from 'path';

@Injectable()
export class FilesService {
    private readonly baseDir: string;
    private readonly tempPath: string;
    private readonly staticPath: string;
    private readonly backendDomain: string;

    constructor(private readonly configService: ConfigService<AllConfigType>) {
        this.baseDir = this.configService.getOrThrow('app.workingDirectory', {
            infer: true,
        });
        this.tempPath = path.join(this.baseDir, 'public', 'temp');
        this.backendDomain = this.configService.getOrThrow('app.backendDomain', {
            infer: true,
        });
        this.staticPath = path.join('static', 'images');
    }

    async uploadPostImage(filename: string, postId: string): Promise<string> {
        const destination = path.join(this.baseDir, 'public', 'images', 'posts', postId);

        if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
        }
        // basename
        const tempFilePath = path.join(this.tempPath, filename);
        const filePath = path.join(destination, filename);

        // 파일을 지정된 경로로 이동
        await fs.promises.rename(tempFilePath, filePath);

        const extention = path.join(this.staticPath, 'posts', postId, filename);

        return `${this.backendDomain}/${extention}`;
    }

    async uploadUserProfileImage(filename: string): Promise<string> {
        const destination = path.join(this.baseDir, 'public', 'images', 'users');
        if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
        }
        const tempFilePath = path.join(this.tempPath, filename);
        const filePath = path.join(destination, filename);
        if (!fs.existsSync(tempFilePath)) {
            throw new NotFoundException('존재하지 않는 프로필 이미지입니다.');
        }
        await fs.promises.rename(tempFilePath, filePath);
        const extention = path.join(this.staticPath, 'users', filename);

        return `${this.backendDomain}/${extention}`;
    }

    deletePostImages(postId: string): void {
        const postImageFolder = path.join(this.baseDir, 'public', 'images', 'posts', postId);

        if (fs.existsSync(postImageFolder)) {
            fs.rmdirSync(postImageFolder, { recursive: true });
        }
    }

    uploadImageUrlInHtml(html: string, postId: number): string {
        return html.replaceAll(/static\/temp\//g, `static/images/posts/${postId}/`);
    }
}
