import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request, Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {ApiBearerAuth} from "@nestjs/swagger";
import {UpdateTaskDto} from "./dto/update-task.dto";

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Get()
  getTasks(
      @Query('page') page: string = '1',
      @Query('limit') limit: string = '10',
      @Query('completed') completed: string,
      @Request() req
  ) {
    const completedBool = completed === 'true' ? true : completed === 'false' ? false : undefined
    return this.tasksService.findAll(req.user.id, Number(page), Number(limit), completedBool)
  }

  @UseGuards(JwtAuthGuard)
  @Get('count')
  getCount(@Request() req) {
    console.log('req.user:', req.user)
    return this.tasksService.countByUser(req.user.id)
  }

  @Get(':id')
  async getTask(@Param('id') id: string) {
    return this.tasksService.findOne(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createTask(@Body() body: CreateTaskDto, @Request() req) {
    return this.tasksService.create(body.title, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateTask(
    @Param('id') id: string,
    @Body() body: UpdateTaskDto,
    @Request() req,
  ) {
    return this.tasksService.update(
      Number(id),
      req.user.id,
      body.completed,
      body.title,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteTask(@Param('id') id: string, @Request() req) {
    return this.tasksService.delete(Number(id), req.user.id);
  }
}
