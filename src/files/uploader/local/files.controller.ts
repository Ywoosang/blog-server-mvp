import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { MulterInterceptor } from './interceptor/multer.interceptor';

@Controller('files')
export class FilesLocalController {
    @Post('/image')
    @UseInterceptors(MulterInterceptor)
    async uploadFile(@UploadedFile() image: Express.Multer.File): Promise<{ filename: string }> {
        if (!image) throw new BadRequestException('파일이 존재하지 않습니다.');

        return {
            filename: image.filename,
        };
    }
}
