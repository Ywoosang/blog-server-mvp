import {
    BadRequestException,
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { ConfigService } from '@nestjs/config';
import { type AllConfigType } from 'src/configs/types/config.type';

@Controller('files')
export class FilesController {
    constructor(
        private readonly configService: ConfigService<AllConfigType>,
        private readonly filesService: FilesService,
    ) {}

    @Post('/image')
    @UseInterceptors(FileInterceptor('image'))
    async uploadFile(
        @UploadedFile() image: Express.Multer.File,
    ): Promise<{ filename: string }> {
        if (!image) throw new BadRequestException('파일이 존재하지 않습니다.');

        return {
            filename: image.filename,
        };
    }
}
