import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/configs/types/config.type';
import validationOptions from './utils/validation-options';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService<AllConfigType>);
    const port = configService.get('app.port', { infer: true }) as string;
    app.enableCors({
        origin: configService.get('app.frontendDomain', { infer: true }),
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type, Accept, Authorization'
    });
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalPipes(new ValidationPipe(validationOptions));

    await app.listen(port);
    Logger.log(`Application running on port ${port}`);
}

bootstrap();
