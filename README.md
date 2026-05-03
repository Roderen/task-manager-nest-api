# Task Manager API

REST API for task management with JWT authentication and Redis caching.

## Tech Stack
- NestJS + TypeScript
- PostgreSQL + TypeORM
- Redis (caching)
- JWT authentication
- Docker

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