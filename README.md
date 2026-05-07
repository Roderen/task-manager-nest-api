# Task Manager API <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" height="28px" alt="Nest Logo"/></a>

A full-stack Task Manager REST API built with NestJS and TypeScript.
Implements production-ready patterns including secure JWT authentication
via httpOnly cookies, Redis caching with smart invalidation,
two-factor password change confirmation via email, and pagination.

Designed as a portfolio project demonstrating full-stack development
skills — from database design with PostgreSQL and TypeORM to
containerization with Docker and E2E testing with Supertest.

Frontend built with React, Redux Toolkit and TailwindCSS is available at - https://github.com/Roderen/task-manager-react

## Features
1. **JWT Authentication** - secure httpOnly cookie-based auth
2. **User Registration & Login** - with bcrypt password hashing
3. **Password Change with 2FA** - email confirmation code via Nodemailer
4. **Redis Caching**
5. **DTO Validation**
6. **Swagger API Documentation**
7. **PostgreSQL with TypeORM**
8. **Docker**
9. **E2E Testing**

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