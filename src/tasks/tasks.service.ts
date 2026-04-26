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
    private redisService: RedisService,
  ) {}

  async findAll(userId: number) {
    const cacheKey = `tasks_user_${userId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const tasks = await this.tasksRepository.find({
      where: { user: { id: userId } },
    });
    await this.redisService.set(cacheKey, tasks);
    return tasks;
  }

  async countByUser(userId: number) {
    const total = await this.tasksRepository.count({ where: { user: { id: userId } } })
    const completed = await this.tasksRepository.count({ where: { user: { id: userId }, completed: true } })
    return { total, completed, uncompleted: total - completed }
  }

  async create(title: string, userId: number) {
    const task = this.tasksRepository.create({ title, user: { id: userId } });
    const saved = await this.tasksRepository.save(task);
    await this.redisService.del(`tasks_user_${userId}`);
    return saved;
  }

  async update(
    id: number,
    userId: number,
    completed?: boolean,
    title?: string,
  ) {
    const task = await this.tasksRepository.findOne({ where: { id } });
    if (!task) return null;
    if (completed !== undefined) task.completed = completed;
    if (title !== undefined) task.title = title;
    const result = await this.tasksRepository.save(task);
    await this.redisService.del(`tasks_user_${userId}`);
    return result;
  }

  async delete(id: number, userId: number) {
    const result = await this.tasksRepository.delete(id);
    await this.redisService.del(`tasks_user_${userId}`);
    return result;
  }

  findOne(id: number) {
    return this.tasksRepository.findOne({ where: { id } });
  }
}
