import {
    BaseEntity,
    Column,
    PrimaryGeneratedColumn,
    Entity,
    OneToMany,
} from 'typeorm';
import { Post } from 'src/post/entities/post.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { Like } from 'src/like/entities/like.entity';
import { UsersRole } from '../users-role.enum';

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: String, unique: true })
    email: string;

    @Column({ type: String, unique: true })
    userId: string;

    @Column({ type: String, unique: true })
    nickname: string;

    @Column()
    description: string;

    @Column()
    profileImage: string;

    @Column()
    role: UsersRole;

    @Column({ nullable: true })
    refreshToken: string;

    @OneToMany(() => Post, (post) => post.user)
    posts: Post[];

    @OneToMany(() => Comment, (comment) => comment.user)
    comments: Comment[];

    @OneToMany(() => Like, (like) => like.post)
    likes: Like[];
}
