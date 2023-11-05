import { 
	BaseEntity, 
	Column, 
	PrimaryGeneratedColumn,
	Entity,
	Unique,
	BeforeInsert,
	OneToMany
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Post } from "src/post/entities/post.entity";
import { Comment } from 'src/comment/entities/comment.entity';
import { Like } from 'src/like/entities/like.entity';

@Entity()
export class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: String, unique: true })
	email: string | null;

	@Column({ type: String, unique: true })
	userLoginId: string;

	@Column({ type: String, unique: true})
	nickname: string;

	@Column({ nullable: true })
	description: string;
	
	@Column({type: "text"})
	password: string;
	
	@OneToMany(() => Post, post=> post.user)
	posts: Post[]

	@OneToMany(() => Comment, comment => comment.user)
	comments: Comment[]

	@OneToMany(() => Like, like => like.post)
	likes: Like[];
	
	@BeforeInsert()
	async setPassword(): Promise<void> {
		const salt = await bcrypt.genSalt();
		this.password = await bcrypt.hash(this.password,salt);
	}
}