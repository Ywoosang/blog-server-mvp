import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { Request } from 'express';
import Multer from 'multer';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/configs/types/config.type';

@Injectable()
export class MulterInterceptor implements NestInterceptor {
    constructor(private configService: ConfigService<AllConfigType>) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return new Observable((observer) => {
            // multer 인스턴스 생성
            const upload = Multer({
                storage: diskStorage({
                    destination: path.join(
                        this.configService.getOrThrow('app.workingDirectory', {
                            infer: true,
                        }),
                        'public',
                        'temp',
                    ),
                    filename: (req, file, callback) => {
                        // uuid + 확장자 형식으로 파일 저장
                        const filename = `${uuidv4()}${path.extname(file.originalname)}`;
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
        const request = context.switchToHttp().getRequest<Request>();
    }
}
