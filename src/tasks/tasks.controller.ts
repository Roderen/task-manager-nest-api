import {Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request} from '@nestjs/common';
import {TasksService} from './tasks.service';
import {CreateTaskDto} from './dto/create-task.dto';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';

@Controller('tasks')
export class TasksController {
    constructor(private tasksService: TasksService) {
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    getTasks(@Request() req) {
        return this.tasksService.findAll(req.user.id)
    }

    @Get(':id')
    async getTask(@Param('id') id: string) {
        return this.tasksService.findOne(Number(id))
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    createTask(@Body() body: CreateTaskDto, @Request() req) {
        return this.tasksService.create(body.title, req.user.id)
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    updateTask(@Param('id') id: string, @Body() body: { completed: boolean }) {
        return this.tasksService.update(Number(id), body.completed)
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    deleteTask(@Param('id') id: string) {
        return this.tasksService.delete(Number(id))
    }
}