import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { UsersSeedService } from './users/users-seed.service';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const runSeed = async () => {
    const app = await NestFactory.create(SeedModule);
    // seed 실행
    await app.get(UsersSeedService).run();
    await app.close();
};

runSeed();
