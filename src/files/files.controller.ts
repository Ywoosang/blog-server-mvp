import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/configs/types/config.type';

@Controller('files')
export class FilesController {
    constructor(
        private readonly configService: ConfigService<AllConfigType>,
        private readonly filesService: FilesService
    ) {}

    @Post('/image')
    @UseInterceptors(FileInterceptor('image'))
    async uploadFile(@UploadedFile() image: Express.Multer.File): Promise<{ filename: string }> {
        return {
            filename: image.filename
        };
    }
}
