import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    BaseEntity,
} from 'typeorm';
import { Post } from 'src/post/entities/post.entity';

@Entity()
export class Tag extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @ManyToMany(() => Post, (post) => post.tags)
    posts: Post[];
}
