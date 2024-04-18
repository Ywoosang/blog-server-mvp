import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { MulterS3Interceptor } from './interceptor/multer-s3.interceptor';

@Controller('files')
export class FilesS3Controller {
    @Post('/image')
    @UseInterceptors(MulterS3Interceptor)
    async uploadFile(@UploadedFile() image: Express.MulterS3.File): Promise<{ filename: string }> {
        if (!image) throw new BadRequestException('파일이 존재하지 않습니다.');
        const filename = image.key.replace('static/temp/', '');
        return {
            filename,
        };
    }
}
