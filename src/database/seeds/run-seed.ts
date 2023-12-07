import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { UsersSeedService } from './users/users-seed.service';

const runSeed = async () => {
    const app = await NestFactory.create(SeedModule);
    // seed 실행
    await app.get(UsersSeedService).run();
    await app.close();
};

runSeed();
