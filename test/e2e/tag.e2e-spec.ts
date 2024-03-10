import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { UsersRole } from 'src/users/users-role.enum';
import validationOptions from 'src/utils/validation-options';
import UserSeeder from '../seeds/users.seed';
import PostSeeder from '../seeds/post.seed';
import { PostService } from 'src/post/post.service';
import * as faker from 'faker';
import 'faker/locale/ko';
import { PostStatus } from 'src/post/post-status.enum';
import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor';
import { AuthService } from 'src/auth/auth.service';
import { ADMIN_EMAIL, USER_EMAIL } from '../consts';

describe('TagController (e2e)', () => {
    let app: INestApplication;
    let accessTokenUser: string;
    let accessTokenAdmin: string;
    let userSeeder: UserSeeder;
    let postSeeder: PostSeeder;
    let testAdminUser: User;
    let testUser: User;
    const postCount = 2;
    const publicPostCount = 1;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        const usersService = moduleFixture.get<UsersService>(UsersService);
        const postService = moduleFixture.get<PostService>(PostService);
        const authService = moduleFixture.get<AuthService>(AuthService);
        userSeeder = new UserSeeder(usersService);
        postSeeder = new PostSeeder(postService);

        testAdminUser = await userSeeder.createTestUser(ADMIN_EMAIL, UsersRole.ADMIN);
        testUser = await userSeeder.createTestUser(USER_EMAIL, UsersRole.USER);

        const adminHash = await authService.generateHash(ADMIN_EMAIL);
        const userHash = await authService.generateHash(USER_EMAIL);

        let response;
        response = await authService.login({ hash: adminHash });
        accessTokenAdmin = response.accessToken;
        response = await authService.login({ hash: userHash });
        accessTokenUser = response.accessToken;

        // 게시물 및 태그들 생성
        const tags = Array.from({ length: 5 }).map(() => {
            return faker.lorem.word();
        });
        // 태그들을 가진 공개 게시물 생성
        await postSeeder.createTestPost(testAdminUser, undefined, undefined, tags);
        // 태그들을 가진 비공개 게시물 생성
        await postSeeder.createTestPost(testAdminUser, PostStatus.PRIVATE, undefined, tags);

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe(validationOptions));
        app.useGlobalInterceptors(new ResponseInterceptor());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/tags (GET)', () => {
        it('게시물이 하나 이상 있는 태그들을 반환한다.', async () => {
            const response = await request(app.getHttpServer())
                .get('/tags')
                .set('Authorization', `Bearer ${accessTokenAdmin}`)
                .expect(200);

            const tags = response.body.tags;
            tags.forEach(tag => {
                expect(tag.id).toBeDefined();
                expect(tag.name).toBeDefined();
                expect(tag.postCount).toEqual(postCount);
            });
        });

        it('로그인하지 않은 사용자가 접근할 때 401 Unauthrized 에러를 반환한다.', async () => {
            await request(app.getHttpServer()).get('/tags').expect(401);
        });

        it('관리자가 아닌 사용자가 태그를 생성할 때 403 Forbiden 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .get('/tags')
                .set('Authorization', `Bearer ${accessTokenUser}`)
                .expect(403);
        });
    });

    describe('/tags/public (GET)', () => {
        it('공개 게시물이 하나 이상 있는 태그들을 반환한다.', async () => {
            const response = await request(app.getHttpServer()).get('/tags/public').expect(200);
            const tags = response.body.tags;
            tags.forEach(tag => {
                expect(tag.id).toBeDefined();
                expect(tag.name).toBeDefined();
                expect(tag.postCount).toEqual(publicPostCount);
            });
        });
    });

    describe('/tags/public/:id?page= &limit= (GET)', () => {
        it('페이지에 해당하는 공개 게시글을 포함한 태그를 반환한다.', async () => {
            const response = await request(app.getHttpServer()).get('/tags/public/1').expect(200);
            const data = response.body;
            expect(data).toHaveProperty('id');
            expect(data).toHaveProperty('name');
            expect(data).toHaveProperty('posts');
            expect(Array.isArray(data.posts)).toBe(true);
        });

        it('없는 태그일 경우 404 Not Found 에러를 반환한다.', async () => {
            await request(app.getHttpServer()).get('/tags/public/1000').expect(404);
        });

        it('없는 페이지일 경우 200 OK 를 반환한다.', async () => {
            await request(app.getHttpServer()).get('/tags/public/1?page=100').expect(200);
        });

        it('page 값이 숫자가 아닌 문자일 경우 400 BadRequest 를 반환한다.', async () => {
            await request(app.getHttpServer())
                .get(`/tags/public/1?page=${encodeURIComponent('가나다')}`)
                .expect(400);
        });

        it('limit 값이 숫자가 아닌 문자일 경우 400 BadRequest 를 반환한다.', async () => {
            await request(app.getHttpServer())
                .get(`/tags/public/1?page=100&limit=${encodeURIComponent('가나다')}`)
                .expect(400);
        });
    });

    describe('/tags/:id?page= &limit= (GET)', () => {
        it('태그와 페이지에 해당하는 태그 게시글들을 반환한다.', async () => {
            const response = await request(app.getHttpServer())
                .get('/tags/1')
                .set('Authorization', `Bearer ${accessTokenAdmin}`)
                .expect(200);
            const data = response.body;
            expect(data).toHaveProperty('id');
            expect(data).toHaveProperty('name');
            expect(data).toHaveProperty('posts');
            expect(Array.isArray(data.posts)).toBe(true);
        });

        it('로그인 하지 않았을 경우 401 Unauthorized 에러를 반환한다.', async () => {
            await request(app.getHttpServer()).get('/tags/1').expect(401);
        });

        it('관리자가 아닐 경우 403 Forbidden 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .get('/tags/1')
                .set('Authorization', `Bearer ${accessTokenUser}`)
                .expect(403);
        });

        it('없는 태그일 경우 404 Not Found 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .get('/tags/1000')
                .set('Authorization', `Bearer ${accessTokenAdmin}`)
                .expect(404);
        });
    });
});
