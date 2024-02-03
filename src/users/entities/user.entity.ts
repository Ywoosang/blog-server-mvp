import { BaseEntity, Column, PrimaryGeneratedColumn, Entity, BeforeInsert, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Post } from 'src/post/entities/post.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { Like } from 'src/like/entities/like.entity';
import { UsersRole } from '../users-role.enum';
import { UsersStatus } from '../users-status.enum';

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: String, unique: true })
    email: string;

    @Column({ type: String, unique: true })
    userLoginId: string;

    @Column({ type: String, unique: true })
    nickname: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    profileImage: string;

    @Column({ type: 'text' })
    password: string;

    @Column()
    role: UsersRole;

    @Column()
    status: UsersStatus;

    @Column({ nullable: true })
    refreshToken: string;

    @OneToMany(() => Post, post => post.user)
    posts: Post[];

    @OneToMany(() => Comment, comment => comment.user)
    comments: Comment[];

    @OneToMany(() => Like, like => like.post)
    likes: Like[];

    @BeforeInsert()
    async setPassword(): Promise<void> {
        const salt = await bcrypt.genSalt();
        this.password = await bcrypt.hash(this.password, salt);
    }
}
