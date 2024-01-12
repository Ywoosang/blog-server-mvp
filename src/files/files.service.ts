import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FilesService {
    constructor(
        @InjectRepository(File)
        private readonly fileRepository: Repository<File>
    ) {}

    async create(filename: string): Promise<File> {
        return this.fileRepository.save(
            this.fileRepository.create({
                filename
            })
        );
    }

    async findById(id: number): Promise<File> {
        return this.fileRepository.findOne({
            where: {
                id
            }
        });
    }
}
