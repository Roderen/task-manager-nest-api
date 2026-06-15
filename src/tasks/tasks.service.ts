import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Task } from './task.entity';
import { RedisService } from '../redis/redis.service';
import { TaskGateway } from './tasks.gateway';
import { User } from 'src/users/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private redisService: RedisService,
    @Inject(forwardRef(() => TaskGateway))
    private taskGateway: TaskGateway,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(
    userId: number,
    page: number = 1,
    limit: number = 10,
    completed?: boolean,
    search?: string,
  ) {
    const cacheKey = `tasks_user_${userId}_page_${page}_limit_${limit}_completed_${completed}_search_${search ?? ''}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const queryBuilder = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoin('task.user', 'user')
      .addSelect('user.email')
      .where('task.userId = :userId', { userId })
      .orderBy('task.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (completed !== undefined) {
      queryBuilder.andWhere('task.completed = :completed', { completed });
    }

    if (search) {
      queryBuilder.andWhere('task.title ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const [tasks, total] = await queryBuilder.getManyAndCount();

    const result = {
      data: tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    await this.redisService.set(cacheKey, result);
    return result;
  }

  async findAllNeedsHelp(page: number = 1, limit: number = 1) {
    const where: FindOptionsWhere<Task> = {
      needsHelp: true,
    };

    const [tasks, total] = await this.tasksRepository.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async countByUser(userId: number) {
    const total = await this.tasksRepository.count({
      where: { user: { id: userId } },
    });
    const completed = await this.tasksRepository.count({
      where: { user: { id: userId }, completed: true },
    });
    return { total, completed, uncompleted: total - completed };
  }

  async create(
    userId: number,
    title: string,
    description?: string,
    needsHelp?: boolean,
  ) {
    const task = this.tasksRepository.create({
      title,
      description,
      needsHelp,
      user: { id: userId },
    });
    const saved = await this.tasksRepository.save(task);
    await this.redisService.delByPattern(`tasks_user_${userId}_*`);
    return saved;
  }

  async update(
    id: number,
    userId: number,
    completed?: boolean,
    title?: string,
    needsHelp?: boolean,
  ) {
    const task = await this.tasksRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!task) return null;
    if (completed !== undefined) task.completed = completed;
    if (title !== undefined) task.title = title;
    if (needsHelp !== undefined) task.needsHelp = needsHelp;
    const result = await this.tasksRepository.save(task);
    await this.redisService.delByPattern(`tasks_user_${userId}_*`);

    if (needsHelp === true) {
      this.taskGateway.notifyHelpNeeded(result, userId);
    }

    if (needsHelp === false) {
      this.taskGateway.notifyHelpCancelNeeded(id);
    }

    return result;
  }

  async delete(id: number, userId: number) {
    const task = await this.tasksRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!task) throw new NotFoundException('Task not found');
    await this.tasksRepository.delete(id);
    await this.redisService.delByPattern(`tasks_user_${userId}_*`);
    return { success: true };
  }

  findOne(id: number, userId: number) {
    return this.tasksRepository.findOne({
      where: { id, user: { id: userId } },
    });
  }

  updateOnlineStatus(userId: number, status: boolean) {
    return this.usersRepository.update(userId, { onlineStatus: status });
  }
}
