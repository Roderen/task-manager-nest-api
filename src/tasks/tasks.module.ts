import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Task} from "./task.entity";
import {User} from "../users/user.entity";
import {RedisModule} from "../redis/redis.module";

@Module({
  imports: [TypeOrmModule.forFeature([Task, User]), RedisModule],
  controllers: [TasksController],
  providers: [TasksService]
})
export class TasksModule {}
