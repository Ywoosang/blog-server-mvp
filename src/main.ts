import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import validationOptions from './utils/validation-options';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const port = process.env.APP_PORT;

    app.useGlobalPipes(new ValidationPipe(validationOptions));
    await app.listen(port);
    Logger.log(`Application running on port ${port}`);
}

bootstrap();
