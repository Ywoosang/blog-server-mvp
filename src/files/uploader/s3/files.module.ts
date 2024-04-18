import { Module } from '@nestjs/common';
import { FilesS3Controller } from './files.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FilesS3Service } from './files.service';

@Module({
    controllers: [FilesS3Controller],
    providers: [ConfigModule, ConfigService, FilesS3Service],
    exports: [FilesS3Service],
})
export class FilesS3Module {}
