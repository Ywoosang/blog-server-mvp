import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BaseEntity } from 'typeorm';
import { Post } from 'src/post/entities/post.entity';

@Entity()
export class File extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    filename: string;

    @ManyToOne(() => Post, post => post.files)
    @JoinColumn({ name: 'postId' })
    post: Post;
}
