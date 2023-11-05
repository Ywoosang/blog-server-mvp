import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { UsersService } from 'src/users/users.service';
import { PostService } from 'src/post/post.service';
import { PostStatus } from 'src/post/post-status.enum';
import { User } from 'src/users/entities/user.entity';
import  UserSeeder from '../seeds/users.seed';
import  PostSeeder from '../seeds/post.seed';
// ctrl + alt + shift + r
describe('PostController (e2e)', () => {
    let app: INestApplication;
    let accessToken: string;
    let userSeeder: UserSeeder;
    let postSeeder: PostSeeder;
    let testUser: User;

    beforeAll(async () => {
        jest.setTimeout(1000000);
		const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        const usersService = moduleFixture.get<UsersService>(UsersService);
        const postService = moduleFixture.get<PostService>(PostService);
        userSeeder = new UserSeeder(usersService);
        postSeeder = new PostSeeder(postService);
        testUser = await userSeeder.createTestUser(1);
        await postSeeder.createTestPosts(testUser, 5, PostStatus.PUBLIC);
        await postSeeder.createTestPosts(testUser, 5, PostStatus.PRIVATE);
        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/post (POST)', () => {
        it('게시물을 생성한다.', async () => {
			const response = await request(app.getHttpServer())
                .post('/auth/signin')
                .send({
                    userLoginId: 'user1',
                    password: 'password1'
                })
                .expect(200);
            accessToken = response.body.accessToken;

            await request(app.getHttpServer())
                .post('/posts')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    title: '제목1',
                    content: `내용1`,
                    status: PostStatus.PUBLIC
                })
                .expect(201);
        })

        it('로그인하지 않은 사용자가 게시물을 생성할 때 401 Unauthrized 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
            .post('/posts')
            .send({
                title: '제목1',
                content: `내용1`,
                status: PostStatus.PUBLIC
            })
            .expect(401);
        })

        it('제목이 없을 때 400 BadRequest 에러를 반환한다.', async() => {
            await request(app.getHttpServer())
            .post('/posts')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                title: '',
                content: '내용1',
                status: PostStatus.PUBLIC
            })
            .expect(400);
        })

        it('내용이 없을 때 400 BadRequest 에러를 반환한다.', async() => {
            await request(app.getHttpServer())
            .post('/posts')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                title: '제목1',
                content: '',
                status: PostStatus.PUBLIC
            })
            .expect(400);
        })
	});
	
	describe('/posts/public?page= (GET)', () => {
        it('현재 페이지의 공개 게시글 목록과 총 게시글 수를 반환한다.', async () => {
			const response = await request(app.getHttpServer()) 
                .get('/posts/public?page=1&limit=2')
                .expect(200);
            const data = response.body;
            expect(data).toHaveProperty('posts');
            expect(data).toHaveProperty('total');
            data.posts.forEach(post => { expect(post.status).toBe(PostStatus.PUBLIC); });
        })

        it('없는 페이지일 경우 빈 게시물 목록과 총 게시글 수를 반환한다.', async () => {
            await request(app.getHttpServer())
                .get('/posts/public?page=10&limit=2')
                .expect((response) => {
                    const data = response.body;
                    expect(data).toHaveProperty('posts');
                    expect(data).toHaveProperty('total');
                    expect(data.posts.length).toBe(0);
                })
        })
    })

    describe('/posts/public/user/:userId',() => {
        it('사용자 블로그의 공개 게시물들을 반환한다.', async()=> {
            const response = await request(app.getHttpServer())
                .get('/posts/public/user/1')
            expect(response.statusCode).toBe(200);
        })

        it('없는 사용자일 경우 404 NotFound 에러를 반환한다.', async()=> {
            await request(app.getHttpServer())
                .get('/posts/public/user/100')
                .expect(404);
        })
    })
	
    describe('/posts/public/:id (GET)', () => {
        it('id 에 해당하는 공개 게시물을 반환한다.', async () => {
            await request(app.getHttpServer())
                .get('/posts/public/1')
                .expect(200);
        })

        it('존재하지 않는 게시물일 경우 404 NotFound 에러를 반환한다.', async() => {
            await request(app.getHttpServer())
                .get('/posts/public/200')
                .expect(404);
        })

        it('비공개 게시물일 경우 403 Forbidden 에러를 반환한다.', async() => {
            await request(app.getHttpServer())
                .get('/posts/public/6')
                .expect(403);
        })
    })

    describe('/posts/user/:userId (GET)', () => {
        it('사용자 블로그의 게시물들을 반환한다.', async () => {
            const response = await request(app.getHttpServer())
                .get('/posts/user/1')
                .set('Authorization', `Bearer ${accessToken}`)
            expect(response.statusCode).toBe(200);
        })

        it('로그인하지 않았을 경우 401 Unauthorized 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .get('/posts/user/1')
                .expect(401);
        })

        it('블로그 주인이 아닐 경우 403 Forbidden 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .get('/posts/user/2')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(403);
        })
    })

    describe('/posts/:id (GET)', () => {
        it('id 에 해당하는 게시물을 반환한다.', async () => {
            await request(app.getHttpServer())
                .get('/posts/1')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
        })

        it('로그인하지 않았을 경우 401 Unauthorized 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .get('/posts/1')
                .expect(401);
        })


        it('존재하지 않는 게시물일 경우 404 NotFound 에러를 반환한다.', async() => {
            await request(app.getHttpServer())
                .get('/posts/200')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);
        })

        it('비공개 게시물일 경우 작성자가 아니라면 403 Forbidden 에러를 반환한다.', async() => {
            const newUser = await userSeeder.createTestUser(2);
            await postSeeder.createTestPost(newUser, PostStatus.PRIVATE);
            await request(app.getHttpServer())
                .get('/posts/12')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(403);
        })
    })

    describe('/posts/:id/status (PATCH)', () => {
        it('게시물의 공개/비공개 상태를 변경한다.', async () => {
            await request(app.getHttpServer())
                .patch('/posts/1/status')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    status: PostStatus.PRIVATE 
                }) 
                .expect(204);
        })

        it('작성자가 아니라면 403 Forbidden 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .patch('/posts/12/status')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    status: PostStatus.PUBLIC
                }) 
                .expect(403);
        })

        it('존재하지 않는 게시물의 상태를 변경하려는 경우 404 NotFound 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .patch('/posts/100/status')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    status: PostStatus.PRIVATE 
                }) 
                .expect(404);
        })
    })

    describe('/posts/:id (DELETE)', () => {
        it('id 에 해당하는 게시물을 삭제한다.', async () => {
            await request(app.getHttpServer())
                .delete('/posts/1')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
        })

        it('작성자가 아니라면 403 Forbidden 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .delete('/posts/12')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(403);
        })

        it('존재하지 않는 게시물을 삭제하려는 경우 404 NotFound 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .delete('/posts/100')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);
        })
    })
});