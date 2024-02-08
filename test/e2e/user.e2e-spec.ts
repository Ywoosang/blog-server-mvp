import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { UsersService } from 'src/users/users.service';
import UserSeeder from '../seeds/users.seed';
import { User } from 'src/users/entities/user.entity';
import { UsersRole } from 'src/users/users-role.enum';
import validationOptions from 'src/utils/validation-options';

describe('UserController (e2e)', () => {
    let app: INestApplication;
    let accessToken: string;
    let userSeeder: UserSeeder;
    let testUser: User;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        const usersService = moduleFixture.get<UsersService>(UsersService);
        userSeeder = new UserSeeder(usersService);
        // 사용자 생성
        testUser = await userSeeder.createTestUser(UsersRole.USER);

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe(validationOptions));
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/users/profile (GET)', () => {
        it('사용자 프로필 정보를 반환한다.', async () => {
            let response = await request(app.getHttpServer())
                .post('/auth/signin')
                .send({
                    userLoginId: testUser.userLoginId,
                    password: 'test@1234'
                })
                .expect(200);
            accessToken = response.body.accessToken;

            response = await request(app.getHttpServer())
                .get('/users/profile')
                .set('Authorization', `Bearer ${accessToken}`);
            expect(response.statusCode).toBe(200);
            testUser = response.body;
            expect(testUser).toHaveProperty('id');
            expect(testUser).toHaveProperty('description');
            expect(testUser).toHaveProperty('userLoginId');
            expect(testUser).toHaveProperty('nickname');
            expect(testUser).toHaveProperty('email');
            expect(testUser).toHaveProperty('role');
        });

        it('사용자 프로필 정보에 비밀번호는 포함되지 않는다.', async () => {
            expect(testUser).not.toHaveProperty('password');
        });
    });

    describe('/users/public/profile/:userLoginId (GET)', () => {
        it('userLoginId 에 해당하는 사용자 공개 프로필 정보를 반환한다.', async () => {
            let response = await request(app.getHttpServer())
                .get(`/users/public/profile/${testUser.userLoginId}`)
                .expect(200);
            expect(response.statusCode).toBe(200);
            const user = response.body;
            expect(user).toHaveProperty('id');
            expect(user).toHaveProperty('description');
            expect(user).toHaveProperty('profileImage');
            expect(user).toHaveProperty('nickname');
            expect(user).toHaveProperty('userLoginId');
        });

        it('존재하지 않는 사용자라면 404 NotFound 를 반환한다.', async () => {
            await request(app.getHttpServer())
                .get(`/users/public/profile/${encodeURIComponent('가나다')}`)
                .expect(404);
        });
    });

    describe('/users/profile (PATCH)', () => {
        it('사용자 프로필 정보를 변경한다.', async () => {
            const nickname = 'ywoosang';
            const description = 'nestJS 블로그 개발 테스트';
            await request(app.getHttpServer())
                .patch('/users/profile')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    nickname,
                    description
                })
                .expect(200);
            const response = await request(app.getHttpServer())
                .get('/users/profile')
                .set('Authorization', `Bearer ${accessToken}`);
            const user = response.body;
            expect(user.nickname).toBe(nickname);
            expect(user.description).toBe(description);
        });

        it('비밀번호는 변경할 수 없어야 한다.', async () => {
            const password = 'password1234';
            await request(app.getHttpServer())
                .patch('/users/profile')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    password: password
                })
                .expect(200);
            const response = await request(app.getHttpServer())
                .get('/users/profile')
                .set('Authorization', `Bearer ${accessToken}`);
            const user = response.body;
            expect(user.password).not.toBe(password);
        });
    });
});
