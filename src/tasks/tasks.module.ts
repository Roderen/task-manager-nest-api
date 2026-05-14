import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Task} from "./task.entity";
import {User} from "../users/user.entity";
import {RedisModule} from "../redis/redis.module";
import {TaskGateway} from "./tasks.gateway";
import {JwtModule} from "@nestjs/jwt";
import {ConfigModule, ConfigService} from "@nestjs/config";

@Module({
  imports: [
      TypeOrmModule.forFeature([Task, User]),
      RedisModule,
      JwtModule.registerAsync({
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          secret: configService.getOrThrow('JWT_SECRET'),
        }),
        inject: [ConfigService],
      })
  ],
  controllers: [TasksController],
  providers: [TasksService, TaskGateway]
})
export class TasksModule {}
