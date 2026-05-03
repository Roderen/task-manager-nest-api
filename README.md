# Task Manager API

REST API for task management with JWT authentication and Redis caching.

## Tech Stack
- NestJS + TypeScript
- PostgreSQL + TypeORM
- Redis (caching)
- JWT authentication
- Docker

## Running with Docker

### Requirements
- Docker and Docker Compose

### Setup
$ git clone https://github.com/Roderen/task-manager-nest-api.git \
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

## Start
### development with watch mode
$ docker compose up --build
$ docker stop task-manager-app-1
$ npm run start:dev

# Production
$ npm run start:prod

## Endpoints
http://localhost:3000/api

## Environment Variables
Copy .env.example to .env and fill in the values. \
JWT_SECRET — any random string, e.g: openssl rand -base64 32