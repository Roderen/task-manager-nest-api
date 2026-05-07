import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import {DataSource} from "typeorm";

describe('Auth (e2e)', () => {
    let app: INestApplication
    let dataSource: DataSource
    const testEmail = `test_${Date.now()}@test.com`
    const testPassword = 'TestPassword123'

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = moduleFixture.createNestApplication()
        app.useGlobalPipes(new ValidationPipe())
        await app.init()

        dataSource = app.get(DataSource)
    })

    afterAll(async () => {
        await dataSource.query(`DELETE FROM "user" WHERE email LIKE 'test_%'`)
        await app.close()
    })

    it('POST /auth/register - should register new user', () => {
        return request(app.getHttpServer())
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword })
            .expect(201)
            .expect(res => {
                expect(res.body.email).toBe(testEmail)
                expect(res.body.id).toBeDefined()
                expect(res.body.password).toBeUndefined()
            })
    })

    it('POST /auth/login - should login new user', () => {
        return request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: testEmail, password: testPassword })
            .expect(201)
            .expect(res => {
                expect(res.body.success).toBe(true)
            })
    })

    it('POST /auth/register - should fail if email already exists', () => {
        return request(app.getHttpServer())
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword })
            .expect(400)
            .expect(res => {
                expect(res.body.message).toBe("Email already exists")
                expect(res.body.error).toBe("Bad Request")
                expect(res.body.statusCode).toBe(400)
            })
    })
})