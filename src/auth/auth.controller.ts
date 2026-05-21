import {
  Body,
  Controller,
  Post,
  Res,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangePasswordConfirmDto } from './dto/change-password-confirm.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {JwtService} from "@nestjs/jwt";

@Controller('auth')
export class AuthController {
  constructor(
      private authService: AuthService,
      private jwtService: JwtService,
  ) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body.email, body.password);
  }

  @UseGuards(ThrottlerGuard)
  @Post('login')
  login(@Body() body: LoginDto, @Res({ passthrough: true }) res: any) {
    return this.authService.login(body.email, body.password, res);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: any) {
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      domain: '.task-manager.lol',
    })
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('checkToken')
  me(@Request() req) {
    return req.user;
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(JwtAuthGuard)
  @Post('change-password/request')
  changePasswordRequest(@Body() body: ChangePasswordDto, @Request() req) {
    return this.authService.changePasswordRequest(
      req.user.id,
      body.newPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password/confirm')
  changePasswordConfirm(
    @Body() body: ChangePasswordConfirmDto,
    @Request() req,
  ) {
    return this.authService.changePasswordConfirm(req.user.id, body.code);
  }

  @UseGuards(JwtAuthGuard)
  @Get('ws-token')
  getWsToken(@Request() req) {
    return { token: this.jwtService.sign(
          { id: req.user.id, email: req.user.email },
          { expiresIn: '1h' }
      )}
  }
}
