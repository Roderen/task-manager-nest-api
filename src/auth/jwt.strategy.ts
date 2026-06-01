import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private redisService: RedisService,
  ) {
    super({
      jwtFromRequest: (req: Request): string | null =>
        (req.cookies as Record<string, string>)?.token ?? null,
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { id: number; email: string }) {
    const token = (req.cookies as Record<string, string>)?.token;
    const isBlacklisted = await this.redisService.get(`blacklist:${token}`);
    if (isBlacklisted) throw new UnauthorizedException('Token revoked');
    return { id: payload.id, email: payload.email };
  }
}
