import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { PostModule } from 'src/post/post.module';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/configs/types/config.type';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import path from 'path';

@Module({
    imports: [
        TypeOrmModule.forFeature([File]),
        forwardRef(() => PostModule),
        MulterModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService<AllConfigType>) => ({
                storage: diskStorage({
                    destination: path.join(
                        configService.get('app.workingDirectory', { infer: true }),
                        'public',
                        'images',
                        'posts'
                    ),
                    filename: (req, file, callback) => {
                        // uuid + 확장자 형식으로 파일 저장
                        const filename = `${uuid()}${path.extname(file.originalname)}`;
                        callback(null, filename);
                    }
                }),
                limits: {
                    fileSize: 1024 * 1024 * 5 // 5MB 제한
                }
            })
        })
    ],
    controllers: [FilesController],
    providers: [FilesService],
    exports: [FilesService]
})
export class FilesModule {}
