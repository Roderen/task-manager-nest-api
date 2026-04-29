import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto'
import {RedisService} from "../redis/redis.service";
import {MailService} from "../mail/mail.service";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private mailService: MailService,
  ) {}

  async register(email: string, password: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new BadRequestException('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create(email, hashedPassword);

    return {
      id: user.id,
      email: user.email,
    };
  }

  async login(email: string, password: string, res: any) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Email does not exist');

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new UnauthorizedException('Invalid password');

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
    });

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { success: true };
  }

  async changePasswordRequest(id: number, newPassword: string) {
    const user = await this.usersService.findMe(id);
    if (!user) return null;

    const code = crypto.randomInt(100000, 999999);
    await this.redisService.set(`change-password:${id}`, {code, newPassword}, 300);

    await this.mailService.sendConfirmationCode(user.email, code.toString());
    return { message: 'Code sent to your email' }
  }

  async changePasswordConfirm(id: number, code: string) {
    const redisData = await this.redisService.get(`change-password:${id}`);
    if (!redisData || redisData.code !== Number(code)) throw new UnauthorizedException('Invalid code or code expired');

    const hashedPassword = await bcrypt.hash(redisData.newPassword, 10);
    await this.usersService.updatePassword(id, hashedPassword)

    await this.redisService.del(`change-password:${id}`);

    return {
      message: 'Password changed successfully',
      success: true
    };
  }
}
