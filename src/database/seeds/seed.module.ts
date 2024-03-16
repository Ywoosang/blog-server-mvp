import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from 'src/configs/app.config';
import databaseConfig from 'src/configs/database.config';
import { DatabaseModule } from '../database.module';
import { UsersSeedModule } from './users/users-seed.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [databaseConfig, appConfig],
            envFilePath: '.env',
        }),
        DatabaseModule,
        UsersSeedModule,
    ],
})
export class SeedModule {}
