import { Injectable } from '@nestjs/common';
import {
    CopyObjectCommand,
    DeleteObjectCommand,
    DeleteObjectsCommand,
    DeleteObjectsCommandInput,
    S3Client,
    ListObjectsV2Command,
    ListObjectsV2CommandOutput,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/configs/types/config.type';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class FilesS3Service extends FilesService {
    private s3: S3Client;
    private s3Bucket: any;

    constructor(protected readonly configService: ConfigService<AllConfigType>) {
        super(configService);
        this.s3 = new S3Client({
            region: configService.get('file.awsS3Region', { infer: true }),
            credentials: {
                accessKeyId: configService.getOrThrow('file.accessKeyId', {
                    infer: true,
                }),
                secretAccessKey: configService.getOrThrow('file.secretAccessKey', {
                    infer: true,
                }),
            },
        });
        this.s3Bucket = configService.getOrThrow('file.awsS3Bucket', {
            infer: true,
        });
    }

    async movePostImage(filename: string, postId: string): Promise<void> {
        let commend;
        commend = new CopyObjectCommand({
            CopySource: `${this.s3Bucket}/static/temp/${filename}`,
            Bucket: this.s3Bucket,
            Key: `static/images/posts/${postId}/${filename}`,
        });

        await this.s3.send(commend);

        commend = new DeleteObjectCommand({
            Bucket: this.s3Bucket,
            Key: `${this.s3Bucket}/static/temp/${filename}`,
        });

        await this.s3.send(commend);
    }

    async deletePostImages(postId: string): Promise<void> {
        try {
            let commend;
            commend = new ListObjectsV2Command({
                Bucket: this.s3Bucket,
                Prefix: `static/images/posts/${postId}`,
            });

            const data: ListObjectsV2CommandOutput = await this.s3.send(commend);

            const deleteObjectsParams: DeleteObjectsCommandInput = {
                Bucket: this.s3Bucket,
                Delete: {
                    Objects: [],
                },
            };

            if (data.Contents) {
                data.Contents.forEach((item) => {
                    deleteObjectsParams.Delete!.Objects!.push({ Key: item.Key });
                });
            }

            commend = new DeleteObjectsCommand(deleteObjectsParams);
            await this.s3.send(commend);
        } catch (err) {
            console.log(err);
        }
    }

    async uploadUserProfileImage(filename: string): Promise<string> {
        let commend;
        commend = new CopyObjectCommand({
            CopySource: `${this.s3Bucket}/static/temp/${filename}`,
            Bucket: this.s3Bucket,
            Key: `static/images/users/${filename}`,
        });

        await this.s3.send(commend);

        commend = new DeleteObjectCommand({
            Bucket: this.s3Bucket,
            Key: `${this.s3Bucket}/static/temp/${filename}`,
        });

        await this.s3.send(commend);
        const s3Region = this.configService.get('file.awsS3Region', { infer: true });
        const objectUrl = `https://${this.s3Bucket}.s3.${s3Region}.amazonaws.com/static/images/users/${filename}`;

        return objectUrl;
    }
}
