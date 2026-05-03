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

  async findAll(userId: number, page: number = 1, limit: number = 10, completed?: boolean) {
    const cacheKey = `tasks_user_${userId}_page_${page}_limit_${limit}_completed_${completed}`

    const cached = await this.redisService.get(cacheKey)
    if (cached) return cached

    const where: any = { user: { id: userId } }
    if (completed !== undefined) where.completed = completed

    const [tasks, total] = await this.tasksRepository.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' }
    })

    const result = {
      data: tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }

    await this.redisService.set(cacheKey, result)
    return result
  }

  async countByUser(userId: number) {
    const total = await this.tasksRepository.count({ where: { user: { id: userId } } })
    const completed = await this.tasksRepository.count({ where: { user: { id: userId }, completed: true } })
    return { total, completed, uncompleted: total - completed }
  }

  async create(title: string, userId: number) {
    const task = this.tasksRepository.create({ title, user: { id: userId } });
    const saved = await this.tasksRepository.save(task);
    await this.redisService.delByPattern(`tasks_user_${userId}_*`)
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
    await this.redisService.delByPattern(`tasks_user_${userId}_*`)
    return result;
  }

  async delete(id: number, userId: number) {
    const result = await this.tasksRepository.delete(id);
    await this.redisService.delByPattern(`tasks_user_${userId}_*`)
    return result;
  }

  findOne(id: number) {
    return this.tasksRepository.findOne({ where: { id } });
  }
}
