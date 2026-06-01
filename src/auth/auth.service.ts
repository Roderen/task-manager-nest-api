import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RedisService } from '../redis/redis.service';
import { MailService } from '../mail/mail.service';
import type { Response } from 'express';

interface RedisChangePasswordConfirm {
  code: number;
  newPassword: string;
}

interface JwtPayload {
  id: number;
  email: string;
  exp: number;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private mailService: MailService,
  ) {}

  async register(email: string, password: string) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.usersService.create(email, hashedPassword);
      return { id: user.id, email: user.email };
    } catch (error) {
      if (
        error instanceof Error &&
        (error as { code?: string }).code === '23505'
      ) {
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }

  async login(email: string, password: string, res: Response) {
    const user = await this.usersService.findByEmail(email);
    const fakeHash =
      '$2b$10$abcdefghijklmnopqrstuuABC123456789012345678901234567890';
    const valid = await bcrypt.compare(password, user?.password ?? fakeHash);
    if (!user || !valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
    });

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      domain: process.env.COOKIE_DOMAIN ?? 'localhost',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { success: true };
  }

  async logout(token: string, res: Response) {
    try {
      const decoded = this.jwtService.verify<JwtPayload>(token);
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await this.redisService.set(`blacklist:${token}`, '1', ttl);
      }
    } catch {
      // clean cookies
    }

    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      domain: process.env.COOKIE_DOMAIN ?? 'localhost',
    });

    return { success: true };
  }

  async changePasswordRequest(id: number, newPassword: string) {
    const user = await this.usersService.findMe(id);
    if (!user) return null;

    const code = crypto.randomInt(100000, 999999);
    await this.redisService.set(
      `change-password:${id}`,
      { code, newPassword },
      300,
    );

    await this.mailService.sendConfirmationCode(user.email, code.toString());
    return { message: 'Code sent to your email' };
  }

  async changePasswordConfirm(id: number, code: string) {
    const redisData = (await this.redisService.get(
      `change-password:${id}`,
    )) as RedisChangePasswordConfirm;
    if (!redisData || redisData.code !== Number(code))
      throw new UnauthorizedException('Invalid code or code expired');

    const hashedPassword = await bcrypt.hash(redisData.newPassword, 10);
    await this.usersService.updatePassword(id, hashedPassword);

    await this.redisService.del(`change-password:${id}`);

    return {
      message: 'Password changed successfully',
      success: true,
    };
  }
}
