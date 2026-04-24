import {
  Body,
  Controller,
  Post,
  Res,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import {RegisterDto} from "./dto/register.dto";
import {LoginDto} from "./dto/login.dto";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body.email, body.password);
  }

  @Post('login')
  login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: any,
  ) {
    return this.authService.login(body.email, body.password, res);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: any) {
    res.clearCookie('token');
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('checkToken')
  me(@Request() req) {
    return req.user;
  }
}
