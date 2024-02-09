import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { UsersRole } from 'src/users/users-role.enum';
import validationOptions from 'src/utils/validation-options';
import { Category } from 'src/category/entities/category.entity';
import { PostService } from 'src/post/post.service';
import { PostStatus } from 'src/post/post-status.enum';
import PostSeeder from '../seeds/post.seed';
import UserSeeder from '../seeds/users.seed';
import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor';

describe('CategoryController (e2e)', () => {
    let app: INestApplication;
    let accessTokenUser: string;
    let accessTokenAdmin: string;
    let userSeeder: UserSeeder;
    let postSeeder: PostSeeder;
    let testAdminUser: User;
    let testUser: User;
    let category: Category;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        const usersService = moduleFixture.get<UsersService>(UsersService);
        userSeeder = new UserSeeder(usersService);

        const postService = moduleFixture.get<PostService>(PostService);
        postSeeder = new PostSeeder(postService);
        // 관리자 생성
        testAdminUser = await userSeeder.createTestUser(UsersRole.ADMIN);
        testUser = await userSeeder.createTestUser(UsersRole.USER);

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe(validationOptions));
        app.useGlobalInterceptors(new ResponseInterceptor());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/categories (POST)', () => {
        const name = '일상';
        it('카테고리를 생성한다.', async () => {
            let response;
            response = await request(app.getHttpServer())
                .post('/auth/signin')
                .send({
                    userLoginId: testAdminUser.userLoginId,
                    password: 'test@1234'
                })
                .expect(200);
            accessTokenAdmin = response.body.accessToken;

            response = await request(app.getHttpServer())
                .post('/auth/signin')
                .send({
                    userLoginId: testUser.userLoginId,
                    password: 'test@1234'
                })
                .expect(200);
            accessTokenUser = response.body.accessToken;

            response = await request(app.getHttpServer())
                .post('/categories')
                .set('Authorization', `Bearer ${accessTokenAdmin}`)
                .send({
                    name
                })
                .expect(201);
            category = response.body;
        });

        it('로그인하지 않은 사용자가 카테고리를 생성할 때 401 Unauthrized 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .post('/categories')
                .send({
                    name
                })
                .expect(401);
        });

        it('관리자가 아닌 사용자가 카테고리를 생성할 때 403 Forbiden 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .post('/categories')
                .set('Authorization', `Bearer ${accessTokenUser}`)
                .send({
                    name
                })
                .expect(403);
        });

        it('카테고리 이름이 없을 때 400 BadRequest 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .post('/categories')
                .set('Authorization', `Bearer ${accessTokenAdmin}`)
                .send({
                    name: ''
                })
                .expect(400);
        });
    });

    describe('/categories/public (GET)', () => {
        it('모든 공개 카테고리 목록을 반환한다.', async () => {
            // 카테고리에 공개 게시글 추가
            await postSeeder.createTestPost(testAdminUser, PostStatus.PUBLIC, category.id);
            // 카테고리에 비공개 게시글 추가
            await postSeeder.createTestPost(testAdminUser, PostStatus.PRIVATE, category.id);

            const response = await request(app.getHttpServer()).get('/categories/public').expect(200);
            const data = response.body;
            expect(data.categories).toBeDefined();
            const categories = data.categories;

            expect(Array.isArray(categories)).toBe(true);
        });

        it('각 카테고리는 id, name, postCount 를 포함해야 한다.', async () => {
            const response = await request(app.getHttpServer()).get('/categories/public').expect(200);
            const data = response.body;
            const categories = data.categories;
            categories.forEach(category => {
                expect(category.name).toBeDefined();
                expect(category.id).toBeDefined();
                expect(category.postCount).toBeDefined();
                expect(category.postCount).toBe(1);
                expect(typeof category.postCount === 'number').toBe(true);
            });
        });
    });

    describe('/categories (GET)', () => {
        it('모든 카테고리 목록을 반환한다.', async () => {
            const response = await request(app.getHttpServer())
                .get('/categories')
                .set('Authorization', `Bearer ${accessTokenAdmin}`)
                .expect(200);
            const data = response.body;
            expect(data.categories).toBeDefined();
            const categories = data.categories;
            expect(Array.isArray(categories)).toBe(true);
            categories.forEach(category => {
                expect(category.name).toBeDefined();
            });
        });

        it('각 카테고리는 id, name, postCount 를 포함해야 한다.', async () => {
            const response = await request(app.getHttpServer())
                .get('/categories')
                .set('Authorization', `Bearer ${accessTokenAdmin}`)
                .expect(200);
            const data = response.body;
            const categories = data.categories;
            categories.forEach(category => {
                expect(category.name).toBeDefined();
                expect(category.id).toBeDefined();
                expect(category.postCount).toBeDefined();
                expect(category.postCount).toBe(2);
                expect(typeof category.postCount === 'number').toBe(true);
            });
        });
    });

    describe('/categories/public/:id?page= &limit= (GET)', () => {
        it('카테고리와 페이지에 해당하는 카테고리 게시글들을 반환한다.', async () => {
            const response = await request(app.getHttpServer()).get('/categories/public/1').expect(200);
            const data = response.body;
            expect(data).toHaveProperty('id');
            expect(data).toHaveProperty('name');
            expect(data).toHaveProperty('posts');
            expect(Array.isArray(data.posts)).toBe(true);
        });

        it('없는 카테고리일 경우 404 Not Found 에러를 반환한다.', async () => {
            await request(app.getHttpServer()).get('/categories/public/2').expect(404);
        });

        it('없는 페이지일 경우 200 OK 를 반환한다.', async () => {
            await request(app.getHttpServer()).get('/categories/public/1?page=100').expect(200);
        });

        it('page 값이 숫자가 아닌 문자일 경우 400 BadRequest 를 반환한다.', async () => {
            await request(app.getHttpServer())
                .get(`/categories/public/1?page=${encodeURIComponent('가나다')}`)
                .expect(400);
        });

        it('limit 값이 숫자가 아닌 문자일 경우 400 BadRequest 를 반환한다.', async () => {
            await request(app.getHttpServer())
                .get(`/categories/public/1?page=100&limit=${encodeURIComponent('가나다')}`)
                .expect(400);
        });
    });

    describe('/categories/:id?page= &limit= (GET)', () => {
        it('카테고리와 페이지에 해당하는 카테고리 게시글들을 반환한다.', async () => {
            const response = await request(app.getHttpServer())
                .get('/categories/1')
                .set('Authorization', `Bearer ${accessTokenAdmin}`)
                .expect(200);
            const data = response.body;
            expect(data).toHaveProperty('id');
            expect(data).toHaveProperty('name');
            expect(data).toHaveProperty('posts');
            expect(Array.isArray(data.posts)).toBe(true);
        });

        it('로그인 하지 않았을 경우 401 Unauthorized 에러를 반환한다.', async () => {
            await request(app.getHttpServer()).get('/categories/1').expect(401);
        });

        it('관리자가 아닐 경우 403 Forbidden 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .get('/categories/1')
                .set('Authorization', `Bearer ${accessTokenUser}`)
                .expect(403);
        });

        it('없는 카테고리일 경우 404 Not Found 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .get('/categories/2')
                .set('Authorization', `Bearer ${accessTokenAdmin}`)
                .expect(404);
        });

        it('없는 페이지일 경우 200 OK 를 반환한다.', async () => {
            await request(app.getHttpServer())
                .get('/categories/1?page=100')
                .set('Authorization', `Bearer ${accessTokenAdmin}`)
                .expect(200);
        });
    });

    describe('/categories/:id (PUT)', () => {
        it('카테고리 이름을 변경한다.', async () => {
            const newCategoryName = '도커';
            const response = await request(app.getHttpServer())
                .put('/categories/1')
                .set('Authorization', `Bearer ${accessTokenAdmin}`)
                .send({
                    name: newCategoryName
                });
            const data = response.body;
            expect(data.name).toBe(newCategoryName);
        });

        it('로그인 하지 않았을 경우 401 Unauthorized 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .put('/categories/1')
                .send({
                    name: 'docker'
                })
                .expect(401);
        });

        it('관리자가 아닐 경우 403 Forbidden 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .put('/categories/1')
                .set('Authorization', `Bearer ${accessTokenUser}`)
                .send({
                    name: 'docker'
                })
                .expect(403);
        });
    });

    describe('/categories/:id (DELETE)', () => {
        it('카테고리를 삭제한다.', async () => {
            await request(app.getHttpServer())
                .delete('/categories/1')
                .set('Authorization', `Bearer ${accessTokenAdmin}`)
                .expect(200);
            await request(app.getHttpServer())
                .get('/categories/1')
                .set('Authorization', `Bearer ${accessTokenAdmin}`)
                .expect(404);
        });
    });
});
