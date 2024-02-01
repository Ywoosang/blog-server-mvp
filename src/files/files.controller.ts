import { Controller, Get, Post, Param, UploadedFile, UseInterceptors, Res, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { Response } from 'express';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/configs/types/config.type';
import path from 'path';

@Controller('files')
export class FilesController {
    constructor(
        private readonly configService: ConfigService<AllConfigType>,
        private readonly filesService: FilesService
    ) {}

    @Post('/image')
    @UseInterceptors(FileInterceptor('image'))
    async uploadFile(@UploadedFile() image: Express.Multer.File): Promise<{ filename: string }> {
        return {
            filename: image.filename
        }
    }
}
