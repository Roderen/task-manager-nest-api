import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: (req: Request): string | null =>
        (req.cookies as Record<string, string>)?.token ?? null,
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  validate(payload: { id: number; email: string }) {
    return { id: payload.id, email: payload.email };
  }
}
