import { Controller, Get, Post, Param, UploadedFile, UseInterceptors, Res, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { File } from './entities/file.entity';
import { Response } from 'express';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/configs/types/config.type';
import path from 'path';

@Controller('files')
export class FilesController {
    constructor(
        private readonly configService: ConfigService<AllConfigType>,
        private readonly filesService: FilesService
    ) {}
    @Post('upload')
    @UseInterceptors(
        FileInterceptor('image', {
            fileFilter: (req, file, cb) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                    return cb(new BadRequestException('이미지 파일만 업로드할 수 있습니다.'), false);
                }
                cb(null, true);
            }
        })
    )
    async uploadImageFile(@UploadedFile() image: Express.Multer.File): Promise<File> {
        return this.filesService.create(image.filename);
    }

    @Get(':filename')
    getFile(@Param('filename') filename: string, @Res() res: Response) {
        const fileStream = fs.createReadStream(
            path.join(
                this.configService.get('app.workingDirectory', { infer: true }),
                'public',
                'images',
                'posts',
                `${filename}`
            )
        );
        fileStream.pipe(res);
    }
}
