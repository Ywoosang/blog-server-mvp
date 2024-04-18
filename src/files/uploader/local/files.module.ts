import { HttpStatus, Module, UnprocessableEntityException } from '@nestjs/common';
import { FilesLocalController } from './files.controller';
import { FilesLocalService } from './files.service';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { type AllConfigType } from 'src/configs/types/config.type';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import path from 'path';
import { MulterInterceptor } from './interceptor/multer.interceptor';

@Module({
    imports: [
        MulterModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService<AllConfigType>) => ({
                fileFilter: (request, file, callback) => {
                    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
                        return callback(
                            new UnprocessableEntityException({
                                status: HttpStatus.UNPROCESSABLE_ENTITY,
                                errors: {
                                    file: `파일 형식이 올바르지 않습니다.`,
                                },
                            }),
                            false,
                        );
                    }
                },
                storage: diskStorage({
                    destination: path.join(
                        configService.getOrThrow('app.workingDirectory', {
                            infer: true,
                        }),
                        'public',
                        'temp',
                    ),
                    filename: (req, file, callback) => {
                        // uuid + 확장자 형식으로 파일 저장
                        const filename = `${uuid()}${path.extname(file.originalname)}`;
                        callback(null, filename);
                    },
                }),
                limits: {
                    fileSize: 1024 * 1024 * 5, // 5MB 제한
                },
            }),
        }),
    ],
    controllers: [FilesLocalController],
    providers: [FilesLocalService, MulterInterceptor],
    exports: [FilesLocalService],
})
export class FilesLocalModule {}

// 현재 방식은 선업로드 방식을 채택하고 사용중
// toastUI 에서 이미지 드롭다운 혹은 업로드를 하면 백엔드에서 해당 이미지가 업로드 되고
// 파일이 저장된 곳의 url 이 나와 이를 바탕으로 본문에 삽입되는 방식
// 그런데 이런 방식으로 작업하게 되면 만약에 업로드 후 본문에서 해당 이미지부분을 지우게되면
// 실제로 쓰이지 않는 이미지인데 S3 에는 올라가 있는 상황이 된다.
// 따라서 이를 지워줘야 한다.

// 먼저 이미지 url 을 저장하는 File 엔티티를 생성하고 이미지 업로드시 id 를 프론트엔드에 전송한 뒤
// 게시물 생성 요청이 왔을 때

// Presigned URL 이란?

// toastUI 를 이용하기 때문에
//
