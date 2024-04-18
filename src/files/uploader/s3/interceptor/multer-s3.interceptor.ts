import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/configs/types/config.type';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import Multer from 'multer';

@Injectable()
export class MulterS3Interceptor implements NestInterceptor {
    constructor(private configService: ConfigService<AllConfigType>) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<Request>();
        return new Observable((observer) => {
            // multer 인스턴스 생성
            const s3 = new S3Client({
                region: this.configService.get('file.awsS3Region', { infer: true }),
                credentials: {
                    accessKeyId: this.configService.getOrThrow('file.accessKeyId', {
                        infer: true,
                    }),
                    secretAccessKey: this.configService.getOrThrow('file.secretAccessKey', {
                        infer: true,
                    }),
                },
            });
            const upload = Multer({
                storage: multerS3({
                    s3,
                    bucket: this.configService.getOrThrow('file.awsS3Bucket', {
                        infer: true,
                    }),
                    acl: 'public-read', // 접근 권한 설정
                    key: (req, file, callback) => {
                        // S3에 저장될 파일의 이름 설정
                        const filename = `static/temp/${uuidv4()}${path.extname(file.originalname)}`;
                        callback(null, filename);
                    },
                }),
                limits: {
                    fileSize: 1024 * 1024 * 5, // 5MB 제한
                },
            }).single('image');

            // 파일 업로드 수행
            upload(request, undefined as any, async (err: any) => {
                if (err) {
                    console.error('파일 업로드 중 에러:', err);
                } else {
                    // 다음 핸들러 실행
                    await next
                        .handle()
                        .toPromise()
                        .then((data) => {
                            observer.next(data);
                            observer.complete();
                        })
                        .catch((err) => {
                            observer.error(err); // 다음 핸들러에서 발생한 에러 처리
                        });
                }
            });
        });
    }
}
