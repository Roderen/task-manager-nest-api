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
$ git clone <repo> \
$ cd task-manager \
$ cp .env.example .env \
$ docker compose up --build

### App will be available at http://localhost:3000

## Running locally

### Requirements
- Node.js 20+
- PostgreSQL
- Redis

### Setup
$ npm install

### Start
# development with watch mode
$ npm run start:dev

# production
$ npm run start:prod

## Endpoints

### Auth
- POST /auth/register — register { email, password }
- POST /auth/login — login, returns JWT token

### Tasks (require Bearer token)
- GET /tasks — list tasks for current user
- GET /tasks/:id — get single task
- POST /tasks — create task { title }
- PUT /tasks/:id — update task { completed }
- DELETE /tasks/:id — delete task

## Environment Variables
Copy .env.example to .env and fill in the values. \
JWT_SECRET — any random string, e.g: openssl rand -base64 32