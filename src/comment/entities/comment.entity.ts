import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Post } from 'src/post/entities/post.entity';

@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @Column({ nullable: true })
    parentCommentId: number;

    @ManyToOne(() => User, user => user.comments)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Post, post => post.comments)
    @JoinColumn({ name: 'postId' })
    post: Post;

    @ManyToOne(() => Comment, comment => comment.replies, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'parentCommentId' })
    parentComment: Comment;

    @OneToMany(() => Comment, comment => comment.parentComment)
    replies: Comment[];
}
