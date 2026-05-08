import {INestApplication, ValidationPipe} from "@nestjs/common";
import {DataSource} from "typeorm";
import request from "supertest";
import {Test, TestingModule} from "@nestjs/testing";
import {AppModule} from "../src/app/app.module";
import cookieParser from "cookie-parser";

describe('Tasks E2E', () => {
    let app: INestApplication;
    let dataSource: DataSource;

    const testEmail = `test_${Date.now()}@test.com`
    const testPassword = 'TestPassword123'
    const testTaskTitle = 'TestTaskTitle'
    let authCookie: string
    let taskId: number

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        }).compile()

        app = moduleFixture.createNestApplication()
        app.useGlobalPipes(new ValidationPipe())
        app.use(cookieParser())
        await app.init()

        dataSource = app.get(DataSource)

        await request(app.getHttpServer())
            .post('/auth/register')
            .send({ email: testEmail, password: testPassword })

        await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: testEmail, password: testPassword })
            .then(res => {
                authCookie = res.headers['set-cookie'][0]
            })
    })

    afterAll(async () => {
        await dataSource.query(`DELETE FROM "task" WHERE "userId" IN (SELECT id FROM "user" WHERE email LIKE 'test_%')`)
        await dataSource.query(`DELETE FROM "user" WHERE email LIKE 'test_%'`)
        await app.close()
    })

    it('POST /tasks - should create a task', () => {
        return request(app.getHttpServer())
            .post('/tasks')
            .set('Cookie', authCookie)
            .send({ title: testTaskTitle })
            .expect(201)
            .expect(res => {
                expect(res.body.id).toEqual(expect.any(Number))
                expect(res.body.title).toBe(testTaskTitle)
                expect(res.body.completed).toBe(false)
                expect(res.body.user).toEqual({
                    id: expect.any(Number)
                })
                expect(res.body.createdAt).toEqual(expect.any(String))
            })
            .then(res => {
                taskId = res.body.id
            })
    })

    it('PUT /tasks/:id - should update a task', () => {
        return request(app.getHttpServer())
            .put(`/tasks/${taskId}`)
            .set('Cookie', authCookie)
            .send({
                title: "TestTaskTitleUpdated",
                completed: true
            })
            .expect(200)
            .expect(res => {
                expect(res.body.id).toEqual(expect.any(Number))
                expect(res.body.title).toBe("TestTaskTitleUpdated")
                expect(res.body.completed).toBe(true)
                expect(res.body.createdAt).toEqual(expect.any(String))
            })
    })

    it('DELETE /tasks/:id - should not delete another user task', async () => {
        const otherEmail = `test_${Date.now()}_other@test.com`

        await request(app.getHttpServer())
            .post('/auth/register')
            .send({ email: otherEmail, password: testPassword })

        const otherCookieRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: otherEmail, password: testPassword })

        const otherCookie = otherCookieRes.headers['set-cookie'][0]

        return request(app.getHttpServer())
            .delete(`/tasks/${taskId}`)
            .set('Cookie', otherCookie)
            .expect(404)
            .expect(res => {
                expect(res.body.message).toBe("Task not found")
                expect(res.body.error).toBe("Not Found")
                expect(res.body.statusCode).toBe(404)
            })
    })

    it('GET /tasks/:id - should not get someone elsw`s task', async () => {
        const otherEmail = `test_${Date.now()}_other@test.com`

        await request(app.getHttpServer())
            .post('/auth/register')
            .send({ email: otherEmail, password: testPassword })

        const otherCookieRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: otherEmail, password: testPassword })

        const otherCookie = otherCookieRes.headers['set-cookie'][0]

        return request(app.getHttpServer())
            .get(`/tasks/${taskId}`)
            .set('Cookie', otherCookie)
            .expect(404)
            .expect(res => {
                expect(res.body.message).toBe("Task not found")
                expect(res.body.error).toBe("Not Found")
                expect(res.body.statusCode).toBe(404)
            })
    })

    it('DELETE /tasks/:id - should delete a task', () => {
        return request(app.getHttpServer())
            .delete(`/tasks/${taskId}`)
            .set('Cookie', authCookie)
            .expect(200)
    })
})