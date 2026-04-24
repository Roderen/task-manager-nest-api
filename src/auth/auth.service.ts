import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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
}
