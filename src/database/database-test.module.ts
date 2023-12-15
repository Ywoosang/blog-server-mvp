import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { User } from 'src/users/entities/user.entity';
// import { Comment } from 'src/comment/entities/comment.entity';
// import { Post } from 'src/post/entities/post.entity';
// import { Category } from 'src/category/entities/category.entity';
// import { Like } from 'src/like/entities/like.entity';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            autoLoadEntities: true
            // entities: [User, Post, Category, Like, Comment]
        })
    ]
})
export class DatabaseTestModule {}
