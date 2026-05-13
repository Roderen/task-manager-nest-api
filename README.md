# Task Manager API <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" height="28px" alt="Nest Logo"/></a>

A full-stack Task Manager REST API built with NestJS and TypeScript.
Implements production-ready patterns including secure JWT authentication
via httpOnly cookies, Redis caching and password change with confirmation via email.

Designed as a portfolio project demonstrating full-stack development
skills.

Frontend built with React, Redux Toolkit and TailwindCSS is available at - https://github.com/Roderen/task-manager-react

## Features
1. **JWT Authentication** - secure httpOnly cookie-based auth
2. **User Registration & Login** - with bcrypt password hashing
3. **Password Change with 2FA** - email confirmation code via Nodemailer
4. **Rate Limiting**
5. **Redis Caching**
6. **Request Validation**
7. **Health Check**
8. **Swagger API Documentation**
9. **PostgreSQL with TypeORM**
10. **Docker**
11. **E2E Testing**
12. **WebSockets** - real-time update tasks via Socket.IO when a task needs help

## WebSocket Events
| Event | Description |
|-------|-------------|
| `helpNeeded` | Emitted when a task is marked as needsHelp: true |

Connect to Socket.IO - `http://localhost:3000`.

## Running with Docker (recommended)

### Requirements
- Docker and Docker Compose

### Setup
```bash
git clone https://github.com/Roderen/task-manager-nest-api.git
cd task-manager-nest-api
cp .env.example .env
docker compose up --build
```

App will be available at http://localhost:3000

## Running in development mode

### Requirements
- Node.js 22.12+

### Setup
```bash
docker compose up postgres redis -d
npm install
npm run start:dev
```

## API Documentation
Swagger UI available at http://localhost:3000/api

## Environment Variables
Copy `.env.example` to `.env` and fill in the values.
`JWT_SECRET` - any random string, e.g: `openssl rand -base64 32`