import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;

    constructor(private configService: ConfigService) {}

    onModuleInit() {
        this.client = new Redis({
            host: this.configService.getOrThrow('REDIS_HOST'),
            port: this.configService.getOrThrow<number>('REDIS_PORT'),
        })
    }

    onModuleDestroy() {
        this.client.quit()
    }

    async get(key: string) {
        const value = await this.client.get(key)
        return value ? JSON.parse(value) : null
    }

    async set(key: string, value: any, ttlSeconds = 60) {
        await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds)
    }

    async del(key: string) {
        await this.client.del(key)
    }

    async delByPattern(pattern: string) {
        const keys = await this.client.keys(pattern)
        if (keys.length > 0) {
            await this.client.del(...keys)
        }
    }
}