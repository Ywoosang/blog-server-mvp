import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import validationOptions from 'src/utils/validation-options';
import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor';
import { AuthService } from 'src/auth/auth.service';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let hash: string;
    let authService: AuthService;

    beforeAll(async () => {
        jest.setTimeout(10000);
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();
        authService = moduleFixture.get<AuthService>(AuthService);

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe(validationOptions));
        app.useGlobalInterceptors(new ResponseInterceptor());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/auth/register (POST)', () => {
        it('사용자를 생성한다.', async () => {
            await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    email: 'test@gmail.com',
                    userId: 'test1234',
                    nickname: '테스트사용자',
                    description: '테스트사용자 입니다.'
                })
                .expect(201);
            // 생성한 사용자의 이메일 hash 값 생성
            hash = await authService.generateHash('test@gmail.com');
        });

        it('이메일이 존재할 경우 409 Conflict 에러를 반환한다.', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    email: 'test@gmail.com',
                    userId: 'test1',
                    nickname: '테스트사용자1',
                    description: '테스트사용자 입니다.'
                })
            expect(response.statusCode).toBe(409);
            const errorDetails = response.body.details;
            expect(Array.isArray(errorDetails)).toBe(true);
            expect(errorDetails.length).toBe(1);
            expect(errorDetails[0].field).toBe('email');
            expect(errorDetails[0].message).toBe('이미 존재하는 이메일 입니다.');
        });

        it('아이디가 존재할 경우 409 Conflict 에러를 반환한다.', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    email: 'test1@gmail.com',
                    userId: 'test1234',
                    nickname: '테스트사용자1',
                    description: '테스트사용자 입니다.'
                })
            expect(response.statusCode).toBe(409);
            const errorDetails = response.body.details;
            expect(Array.isArray(errorDetails)).toBe(true);
            expect(errorDetails.length).toBe(1);
            expect(errorDetails[0].field).toBe('userId');
            expect(errorDetails[0].message).toBe('이미 존재하는 아이디 입니다.');
        });

        it('닉네임이 존재할 경우 409 Conflict 에러를 반환한다.', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    email: 'test1@gmail.com',
                    userId: 'test1',
                    nickname: '테스트사용자',
                    description: '테스트사용자 입니다.'
                })
            expect(response.statusCode).toBe(409);
            const errorDetails = response.body.details;
            expect(Array.isArray(errorDetails)).toBe(true);
            expect(errorDetails.length).toBe(1);
            expect(errorDetails[0].field).toBe('nickname');
            expect(errorDetails[0].message).toBe('이미 존재하는 닉네임 입니다.');
        });

        it('이메일, 아이디, 닉네임이 각각 존재할 경우 각각 에러메시지를 포함해야 한다.', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    email: 'test@gmail.com',
                    userId: 'test1234',
                    nickname: '테스트사용자',
                    description: '테스트사용자 입니다.'
                })
            const errorDetails = response.body.details;
            expect(errorDetails.length).toBe(3);
            errorDetails.forEach(detail => {
                expect(detail).toHaveProperty('field');
                expect(detail).toHaveProperty('message');
            });
        });

        it('이메일 형식이 아닐때 400 BadRequest 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    email: 'test',
                    userId: 'ywoosang',
                    nickname: '테스트사용자',
                    description: '테스트사용자 입니다.'
                })
                .expect(400);
        });

        it('아이디 형식이 올바르지 않을 때 400 BadRequest 에러를 반환한다.', async () => {
            await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    email: 'test@gmail.com',
                    userId: 't',
                    nickname: '테스트사용자',
                    description: '테스트사용자 입니다.'
                })
                .expect(400);
        });

        it('닉네임이 올바르지 않을 때 400 BadRequest 에러를 반환한다.', () => {
            request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    email: 'test@gmail.com',
                    userId: 'ywoosang',
                    nickname: '테',
                    description: '테스트사용자 입니다.'
                })
                .expect(400);
        });
    });

    describe('/auth/login (POST)', () => {
        let response;
        it('로그인이 성공할 경우 200 OK 를 반환한다.', async () => {
            response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    hash
                })
            expect(response.statusCode).toBe(200);
        });

        it('로그인이 성공할 경우 accessToken 과 refreshToken 을 담아 응답한다.', async () => {
            const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
            const { accessToken, refreshToken } = response.body;
            expect(jwtRegex.test(accessToken)).toBe(true);
            expect(jwtRegex.test(refreshToken)).toBe(true);
        });

        it('유효하지 않은 요청이라면 422 UnprocessableEntity 에러를 반환한다.', async () => {
            response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    hash: 'abcd'
                })
            expect(response.statusCode).toBe(422);
            expect(response.body.message).toBe('처리할 수 없는 요청입니다.');
        });

        it('사용자를 찾을 수 없다면 404 NotFound 에러를 반환한다.', async () => {
            const anotherHash = await authService.generateHash('abc@gmail.com');

            response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    hash: anotherHash
                })
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('사용자를 찾을 수 없습니다.');
        });
    });
});
