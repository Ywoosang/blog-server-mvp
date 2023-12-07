import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Post } from 'src/post/entities/post.entity';

@Entity()
export class Like {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, user => user.likes)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Post, post => post.likes)
    @JoinColumn({ name: 'postId' })
    post: Post;
}
