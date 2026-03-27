import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>,
        private redisService: RedisService
    ) {}

    async findAll(userId: number) {
        const cacheKey = `tasks_user_${userId}`
        const cached = await this.redisService.get(cacheKey)
        if (cached) return cached

        const tasks = await this.tasksRepository.find({ where: { user: { id: userId } } })
        await this.redisService.set(cacheKey, tasks)
        return tasks
    }

    async create(title: string, userId: number) {
        const task = this.tasksRepository.create({ title, user: { id: userId } })
        const saved = await this.tasksRepository.save(task)
        await this.redisService.del(`tasks_user_${userId}`)
        return saved
    }

    async update(id: number, completed: boolean) {
        const task = await this.tasksRepository.findOne({ where: { id } })
        if (!task) return null
        task.completed = completed
        return this.tasksRepository.save(task)
    }

    delete(id: number) {
        return this.tasksRepository.delete(id)
    }

    findOne(id: number) {
        return this.tasksRepository.findOne({ where: { id } })
    }
}