import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { UsersService } from 'src/users/users.service';
import { PostService } from 'src/post/post.service';
import { PostStatus } from 'src/post/post-status.enum';
import { User } from 'src/users/entities/user.entity';
import UserSeeder from '../seeds/users.seed';
import PostSeeder from '../seeds/post.seed';
import { UsersRole } from 'src/users/users-role.enum';

describe('LikeController (e2e)', () => {
    let app: INestApplication;
    let accessTokenUser: string;
    let userSeeder: UserSeeder;
    let postSeeder: PostSeeder;
    let testUser: User;

    beforeAll(async () => {
        jest.setTimeout(1000000);
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        const usersService = moduleFixture.get<UsersService>(UsersService);
        const postService = moduleFixture.get<PostService>(PostService);
        userSeeder = new UserSeeder(usersService);
        postSeeder = new PostSeeder(postService);
        // 사용자 생성
        testUser = await userSeeder.createTestUser(UsersRole.USER);
        // 게시물 생성
        await postSeeder.createTestPost(testUser, PostStatus.PUBLIC);
        await postSeeder.createTestPost(testUser, PostStatus.PRIVATE);
        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/likes/posts/:id (POST)', () => {
        it('좋아요를 생성한다.', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/signin')
                .send({
                    userLoginId: testUser.userLoginId,
                    password: 'test@1234'
                })
                .expect(200);
            accessTokenUser = response.body.accessToken;

            await request(app.getHttpServer())
                .post('/likes/posts/1')
                .set('Authorization', `Bearer ${accessTokenUser}`)
                .expect(201);
        });

        it('로그인하지 않은 사용자가 좋아요를 생성할 때 401 Unauthrized 에러를 반환한다.', async () => {
            await request(app.getHttpServer()).post('/likes/posts/1').expect(401);
        });

        it('비공개 게시물에 좋아요를 생성할 때 403 Forbidden 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .post('/likes/posts/2')
                .set('Authorization', `Bearer ${accessTokenUser}`)
                .expect(403);
        });

        it('존재하지 않는 게시물일 때 404 NotFound 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .post('/likes/posts/123123')
                .set('Authorization', `Bearer ${accessTokenUser}`)
                .expect(404);
        });

        it('게시물 번호 형식이 아닐 때 400 BadRequest 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .post(encodeURI('/likes/posts/가나다'))
                .set('Authorization', `Bearer ${accessTokenUser}`)
                .expect(400);
        });
    });

    describe('/likes/posts/:id (GET)', () => {
        it('게시물에 달린 좋아요를 가져온다.', async () => {
            const response = await request(app.getHttpServer()).get('/likes/posts/1').expect(200);
            const likes = response.body;
            expect(Array.isArray(likes)).toBe(true);
            likes.forEach(like => {
                expect(like).toHaveProperty('id');
                expect(like).toHaveProperty('createdAt');
                expect(like).toHaveProperty('user');
            });
        });

        it('존재하지 않는 게시물일 때 404 NotFound 에러를 반환한다.', async () => {
            await request(app.getHttpServer()).get('/likes/posts/100').expect(404);
        });

        it('게시물 번호 형식이 아닐 때 400 BadRequest 에러를 반환한다.', async () => {
            await request(app.getHttpServer()).get(encodeURI('/likes/posts/가나다')).expect(400);
        });
    });

    describe('/likes/posts/:id (DELETE)', () => {
        it('좋아요를 취소한다.', async () => {
            await request(app.getHttpServer())
                .delete('/likes/posts/1')
                .set('Authorization', `Bearer ${accessTokenUser}`)
                .expect(200);
        });

        it('게시물 번호 형식이 아닐 때 400 BadRequest 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .delete(encodeURI('/likes/posts/가나다'))
                .set('Authorization', `Bearer ${accessTokenUser}`)
                .expect(400);
        });

        it('비공개 게시물에 좋아요를 삭제할 때 403 Forbidden 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .delete('/likes/posts/2')
                .set('Authorization', `Bearer ${accessTokenUser}`)
                .expect(403);
        });
    });
});
