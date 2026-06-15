import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/common/decorators/current-user.decorator';
import { GetTasksDto } from './dto/get-tasks.dto';
import { HelpTasksDto } from './dto/help-tasks.dto';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Get()
  getTasks(
    @Query() { page, limit, completed, search }: GetTasksDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasksService.findAll(
      user.id,
      Number(page),
      Number(limit),
      completed,
      search,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('help')
  getNeedsHelpTasks(@Query() { page, limit }: HelpTasksDto) {
    return this.tasksService.findAllNeedsHelp(Number(page), Number(limit));
  }

  @UseGuards(JwtAuthGuard)
  @Get('count')
  getCount(@CurrentUser() user: AuthUser) {
    console.log('req.user:', user);
    return this.tasksService.countByUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getTask(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const task = await this.tasksService.findOne(Number(id), user.id);
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createTask(@Body() body: CreateTaskDto, @CurrentUser() user: AuthUser) {
    return this.tasksService.create(
      user.id,
      body.title,
      body.description,
      body.needsHelp,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateTask(
    @Param('id') id: string,
    @Body() body: UpdateTaskDto,
    @CurrentUser() user: AuthUser,
  ) {
    const task = await this.tasksService.findOne(Number(id), user.id);
    if (!task) throw new NotFoundException('Task not found');
    return this.tasksService.update(
      Number(id),
      user.id,
      body.completed,
      body.title,
      body.needsHelp,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteTask(@Param('id') id: number, @CurrentUser() user: AuthUser) {
    return this.tasksService.delete(Number(id), user.id);
  }
}
