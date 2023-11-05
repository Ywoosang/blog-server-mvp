import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/app.module';

describe('AuthController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        jest.setTimeout(10000);
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
    });


    afterAll(async () => {
        await app.close();
    });

    describe('/auth/signup (POST)', () => {
        it('사용자를 생성한다.', async () => {
            await request(app.getHttpServer())
                .post('/auth/signup')
                .send({
                    email: 'test@gmail.com',
                    userLoginId: 'ywoosang',
                    nickname: '테스트 사용자',
                    password: 'pwd123',
                })
                .expect(201);
        });

        it('사용자가 존재할 경우 409 Conflict 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .post('/auth/signup')
                .send({
                    email: 'test@gmail.com',
                    userLoginId: 'ywoosang',
                    nickname: '테스트 사용자',
                    password: 'pwd123',
                })
                .expect(409);
        })

        it('이메일 형식이 아닐때 400 BadRequest 에러를 반환한다.', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/signup')
                .send({
                    email: 'test',
                    userLoginId: 'ywoosang',
                    nickname: '테스트 사용자',
                    password: 'pwd123',
                })
                .expect(400);
        })


        it('아이디 형식이 올바르지 않을 때 400 BadRequest 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .post('/auth/signup')
                .send({
                    email: 'test@gmail.com',
                    userLoginId: '-',
                    nickname: '테스트 사용자',
                    password: 'pwd123',
                })
                .expect(400);
        })

        it('비밀번호 형식이 올바르지 않을 때 400 BadRequest 에러를 반환한다.', () => {
            request(app.getHttpServer())
                .post('/auth/signup')
                .send({
                    email: 'test@gmail.com',
                    userLoginId: 'ywoosang',
                    nickname: '테스트 사용자',
                    password: '-'
                })
                .expect(400);
        })


        it('닉네임이 올바르지 않을 때 400 BadRequest 에러를 반환한다.', () => {
            request(app.getHttpServer())
                .post('/auth/signup')
                .send({
                    email: 'test@gmail.com',
                    userLoginId: 'ywoosang',
                    nickname: '-',
                    password: 'pwd123'
                })
                .expect(400);
        })
    });


    describe('/auth/signin (POST)', () => {
        it('로그인이 성공할 경우 200 OK 를 반환한다.', async () => {
            await request(app.getHttpServer())
                .post('/auth/signin')
                .send({
                    userLoginId: 'ywoosang',
                    password: 'pwd123',
                })
                .expect(200);
        })

        it('로그인이 성공할 경우 JWT 토큰을 담아 응답한다.', async () => {
            const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
            const response = await request(app.getHttpServer())
                .post('/auth/signin')
                .send({
                    userLoginId: 'ywoosang',
                    password: 'pwd123',
                })
            const accessToken = response.body.accessToken;
            const isJWT = jwtRegex.test(accessToken);
            expect(isJWT).toBe(true);
        });

        it('존재하지 않는 사용자라면 401 Unauthorized 를 반환한다.', async () => {
            await request(app.getHttpServer())
                .post('/auth/signin')
                .send({
                    userLoginId: 'test',
                    password: 'test123',
                })
                .expect(401);
        })

        it('비밀번호가 틀렸다면 401 Unauthorized 를 반환한다.', async () => {
            await request(app.getHttpServer())
                .post('/auth/signin')
                .send({
                    userLoginId: 'ywoosang',
                    password: 'test123',
                })
                .expect(401);
        })
    });
});

// https://stackoverflow.com/questions/66193796/using-test-database-when-e2e-testing-nestjs