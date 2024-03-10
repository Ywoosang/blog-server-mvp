import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GravatarModule } from 'src/gravatar/gravatar.module';
import { User } from 'src/users/entities/user.entity';
import { UsersSeedService } from './users-seed.service';

@Module({
    imports: [TypeOrmModule.forFeature([User]), GravatarModule],
    providers: [UsersSeedService],
    exports: [UsersSeedService],
})
export class UsersSeedModule {}
