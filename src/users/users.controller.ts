import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import type { AuthUser } from 'src/common/decorators/current-user.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: AuthUser) {
    return this.usersService.findMe(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  updateMe(@Body() body: UpdateUserDto, @CurrentUser() user: AuthUser) {
    return this.usersService.updateMe(user.id, body);
  }
}
