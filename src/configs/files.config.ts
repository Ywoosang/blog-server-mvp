import { registerAs } from '@nestjs/config';
import { IsEnum, IsString, ValidateIf } from 'class-validator';
import validateConfig from 'src/utils/validate-config';
import { FileDriver } from 'src/files/enum/file-driver.enum';
import { FilesConfig } from './types/config.type';

class EnvironmentVariablesValidator {
    @IsEnum(FileDriver)
    FILE_DRIVER: FileDriver;

    @ValidateIf((envValues) => FileDriver.S3 == envValues.FILE_DRIVER)
    @IsString()
    AWS_ACCESS_KEY_ID: string;

    @ValidateIf((envValues) => FileDriver.S3 == envValues.FILE_DRIVER)
    @IsString()
    AWS_SECRET_ACCESS_KEY: string;

    @ValidateIf((envValues) => FileDriver.S3 == envValues.FILE_DRIVER)
    @IsString()
    AWS_S3_BUCKET: string;

    @ValidateIf((envValues) => FileDriver.S3 == envValues.FILE_DRIVER)
    @IsString()
    AWS_S3_REGION: string;
}

export default registerAs<FilesConfig>('file', () => {
    validateConfig(process.env, EnvironmentVariablesValidator);
    return {
        driver: (process.env.FILE_DRIVER as FileDriver | undefined) ?? FileDriver.LOCAL,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        awsS3Region: process.env.AWS_S3_REGION,
        awsS3Bucket: process.env.AWS_S3_BUCKET,
        maxFileSize: 5242880, // 15mb
    };
});
