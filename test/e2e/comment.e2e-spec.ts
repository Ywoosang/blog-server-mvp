import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { UsersService } from 'src/users/users.service';
import { PostService } from 'src/post/post.service';
import { PostStatus } from 'src/post/post-status.enum';
import { CommentService } from 'src/comment/comment.service';
import { User } from 'src/users/entities/user.entity';
import UserSeeder from '../seeds/users.seed';
import PostSeeder from '../seeds/post.seed';
import CommentSeeder from '../seeds/comment.seed';
import { UsersRole } from 'src/users/users-role.enum';
import validationOptions from 'src/utils/validation-options';
import * as faker from 'faker';
import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor';
import { USER_EMAIL, USER_EMAIL_SECOND } from '../consts';
import { AuthService } from 'src/auth/auth.service';

describe('CommentController (e2e)', () => {
    let app: INestApplication;
    let accessTokenUser: string;
    let userSeeder: UserSeeder;
    let postSeeder: PostSeeder;
    let commentSeeder: CommentSeeder;
    let testUser: User;
    let testUserSecond: User;

    beforeAll(async () => {
        jest.setTimeout(1000000);
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        const usersService = moduleFixture.get<UsersService>(UsersService);
        const postService = moduleFixture.get<PostService>(PostService);
        const commentService = moduleFixture.get<CommentService>(CommentService);
        const authService = moduleFixture.get<AuthService>(AuthService);

        userSeeder = new UserSeeder(usersService);
        postSeeder = new PostSeeder(postService);
        commentSeeder = new CommentSeeder(commentService);

        testUser = await userSeeder.createTestUser(USER_EMAIL, UsersRole.USER);
        testUserSecond = await userSeeder.createTestUser(USER_EMAIL_SECOND, UsersRole.USER);
        const userHash = await authService.generateHash(USER_EMAIL);

        let response;
        response = await authService.login({ hash: userHash });
        accessTokenUser = response.accessToken;

        const publicPostPromises = Array.from({ length: 5 }).map(() => {
            return postSeeder.createTestPost(testUser);
        });
        await Promise.all(publicPostPromises);

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe(validationOptions));
        app.useGlobalInterceptors(new ResponseInterceptor());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/comments (POST)', () => {
        const content = faker.lorem.paragraph();
        it('게시물에 대한 댓글을 생성한다.', async () => {
            await request(app.getHttpServer())
                .post('/comments')
                .set('Authorization', `Bearer ${accessTokenUser}`)
                .send({
                    content,
                    postId: 1
                })
                .expect(201);
        });

        it('로그인하지 않은 사용자가 댓글을 생성할 때 401 Unauthrized 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .post('/comments')
                .send({
                    content,
                    postId: 1
                })
                .expect(401);
        });

        it('내용이 없을 때 400 BadRequest 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .post('/comments')
                .set('Authorization', `Bearer ${accessTokenUser}`)
                .send({
                    content: '',
                    postId: 1
                })
                .expect(400);
        });

        it('게시물 아이디가 없을 때 400 BadRequest 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .post('/comments')
                .set('Authorization', `Bearer ${accessTokenUser}`)
                .send({
                    content
                })
                .expect(400);
        });
    });

    describe('/comments/:parentCommentId/replies (POST)', () => {
        const content = faker.lorem.paragraph();
        it('대댓글을 생성한다.', async () => {
            await request(app.getHttpServer())
                .post('/comments/1/replies')
                .set('Authorization', `Bearer ${accessTokenUser}`)
                .send({
                    content,
                    replyToId: testUser.id
                })
                .expect(201);
        });

        it('없는 댓글에 대한 대댓글이라면 404 NotFound 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .post('/comment/100/replies')
                .set('Authorization', `Bearer ${accessTokenUser}`)
                .send({
                    content,
                    replyToId: testUser.id
                })
                .expect(404);
        });

        it('내용이 없을 때 400 BadRequest 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .post('/comments/1/replies')
                .set('Authorization', `Bearer ${accessTokenUser}`)
                .send({
                    content: '',
                    replyToId: testUser.id
                })
                .expect(400);
        });
    });

    describe('/comments/posts/:postId (GET)', () => {
        it('게시물에 달린 댓글들을 반환한다.', async () => {
            // 공개 게시물 생성
            const postId = 1;
            let parent = await commentSeeder.createTestComment(testUser, postId);
            for (let i = 0; i < 10; i++) {
                parent = await commentSeeder.createTestReply(testUser, parent.id);
            }
            const response = await request(app.getHttpServer()).get('/comments/posts/1');
            expect(response.statusCode).toBe(200);
            const comments = response.body;
            expect(Array.isArray(comments)).toBe(true);
            comments.forEach(comment => {
                expect(comment).toHaveProperty('id');
                expect(comment).toHaveProperty('content');
                expect(comment).toHaveProperty('replies');
                expect(comment).toHaveProperty('user');
            });
        });
    });

    describe('/comments/:id (PUT)', () => {
        it('댓글 내용을 수정한다.', async () => {
            const response = await request(app.getHttpServer())
                .put('/comments/1')
                .set('Authorization', `Bearer ${accessTokenUser}`)
                .send({
                    content: '수정된 내용'
                });
            expect(response.statusCode).toBe(200);
            expect(response.body.content).toBe('수정된 내용');
        });

        it('댓글 작성자가 아니라면 403 Forbidden 에러를 반환한다.', async () => {
            await postSeeder.createTestPost(testUserSecond, PostStatus.PUBLIC);
            const comment = await commentSeeder.createTestComment(testUserSecond, 1);
            await request(app.getHttpServer())
                .put(`/comments/${comment.id}`)
                .set('Authorization', `Bearer ${accessTokenUser}`)
                .send({
                    content: '수정된 내용'
                })
                .expect(403);
        });

        it('빈 내용으로 수정하려고 할 때 400 BadRequest 에러를 반환한다.', async () => {
            const response = await request(app.getHttpServer())
                .put('/comments/1')
                .set('Authorization', `Bearer ${accessTokenUser}`)
                .send({
                    content: ''
                });
            expect(response.statusCode).toBe(400);
        });
    });

    describe('/comments/:id (DELETE)', () => {
        it('댓글을 삭제한다.', async () => {
            await request(app.getHttpServer())
                .delete('/comments/1')
                .set('Authorization', `Bearer ${accessTokenUser}`)
                .expect(200);
        });

        it('댓글 작성자가 아니라면 403 Forbidden 에러를 반환한다.', async () => {
            const post = await postSeeder.createTestPost(testUserSecond, PostStatus.PUBLIC);
            const comment = await commentSeeder.createTestComment(testUserSecond, post.id);
            await request(app.getHttpServer())
                .delete(`/comments/${comment.id}`)
                .set('Authorization', `Bearer ${accessTokenUser}`)
                .send({
                    content: '수정된 내용'
                })
                .expect(403);
        });
    });
});
