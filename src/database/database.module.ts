import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
            useFactory: (config) => ({
                type: config.get('database.type', { infer: true }),
                host: config.get('database.host', { infer: true }),
                port: config.get('database.port', { infer: true }),
                username: config.get('database.username', { infer: true }),
                password: config.get('database.password', { infer: true }),
                database: config.get('database.name', { infer: true }),
                synchronize: config.get('database.synchronize', { infer: true }),
                autoLoadEntities: true
            }),
            inject: [ConfigService]
        })
    ]
})
export class DatabaseModule { }
