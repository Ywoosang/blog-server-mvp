import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/configs/types/config.type';
import * as fs from 'fs';
import path from 'path';

@Injectable()
export class FilesService {
    private readonly baseDir: string;

    constructor(
        private readonly configService: ConfigService<AllConfigType>
    ) {
        this.baseDir = this.configService.get('app.workingDirectory', { infer: true });
    }

    async uploadPostImage(filename: string, postId: string): Promise<string> {
      const tempPath = path.join(
          this.baseDir,
          'public',
          'temp'
      );

      const destination = path.join(
          this.baseDir,
          'public',
          'images',
          'posts',
          postId
      );
        
      if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
      }
      // basename
      const tempFilePath = path.join(tempPath, filename);
      const filePath = path.join(destination, filename);

      console.log(tempFilePath);
      console.log(filePath);

      // 파일을 지정된 경로로 이동
      await fs.promises.rename(tempFilePath, filePath);

      return filePath;
    }
}
