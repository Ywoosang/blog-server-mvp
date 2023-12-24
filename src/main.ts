import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const port = process.env.APP_PORT;
    await app.listen(port);
    Logger.log(`Application running on port ${port}`);
}

bootstrap();
