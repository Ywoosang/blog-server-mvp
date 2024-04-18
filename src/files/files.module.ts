import { Module } from '@nestjs/common';
import fileConfig from 'src/configs/files.config';
import { FilesConfig } from 'src/configs/types/config.type';
import { FileDriver } from './enum/file-driver.enum';
import { FilesLocalModule } from './uploader/local/files.module';
import { FilesS3Module } from './uploader/s3/files.module';
import { FilesService } from './files.service';
import { FilesLocalService } from './uploader/local/files.service';
import { FilesS3Service } from './uploader/s3/files.service';

const uploaderModule = (fileConfig() as FilesConfig).driver === FileDriver.LOCAL ? FilesLocalModule : FilesS3Module;

const uploaderService = (fileConfig() as FilesConfig).driver === FileDriver.LOCAL ? FilesLocalService : FilesS3Service;
@Module({
    imports: [uploaderModule],
    providers: [
        {
            provide: FilesService,
            useClass: uploaderService,
        },
    ],
    exports: [FilesService, uploaderModule],
})
export class FilesModule {}
