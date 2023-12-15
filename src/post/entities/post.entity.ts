import {
    BaseEntity,
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';

import { PostStatus } from '../post-status.enum';
import { User } from 'src/users/entities/user.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { Like } from 'src/like/entities/like.entity';
import { Category } from 'src/category/entities/category.entity';

@Entity()
export class Post extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    content: string;

    @Column()
    status: PostStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, user => user.posts, { eager: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Category, category => category.posts, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'categoryId' })
    category: Category;

    @OneToMany(() => Comment, comment => comment.post)
    comments: Comment[];

    @OneToMany(() => Like, like => like.post)
    likes: Like[];
}
