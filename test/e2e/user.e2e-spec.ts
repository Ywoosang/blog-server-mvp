import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { UsersService } from 'src/users/users.service';
import UserSeeder from '../seeds/users.seed';
import { User } from 'src/users/entities/user.entity';
import { UsersRole } from 'src/users/users-role.enum';

describe('UserController (e2e)', () => {
    let app: INestApplication;
    let accessToken: string;
    let userSeeder: UserSeeder;
    let testUser: User;

    beforeAll(async () => {
        jest.setTimeout(1000000);
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();
        const usersService = moduleFixture.get<UsersService>(UsersService);
        userSeeder = new UserSeeder(usersService);
        testUser = await userSeeder.createTestUser(UsersRole.USER);
        app = moduleFixture.createNestApplication();
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
                .expect(204);
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
                .expect(204);
            const response = await request(app.getHttpServer())
                .get('/users/profile')
                .set('Authorization', `Bearer ${accessToken}`);
            const user = response.body;
            expect(user.password).not.toBe(password);
        });
    });
});
